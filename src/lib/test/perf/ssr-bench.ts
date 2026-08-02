/**
 * SSR cost benchmark and regression gate. Run with `bun run bench:ssr` (builds a production SSR
 * bundle first — dev transform costs differ from a built bundle by enough to invert conclusions).
 *
 * Three axes, because one number cannot tell "fast" apart from "did not do the work":
 *
 * 1. **Marginal cost per card.** A single render conflates per-component cost with fixed render
 *    setup, so each number is the slope between two instance counts. Layers are interleaved across
 *    rounds so machine drift hits each equally, and each layer reports its MINIMUM round — for
 *    CPU-bound work the floor is the signal and everything above it is scheduler interference.
 * 2. **Output fingerprint.** Bytes per card plus a SHA of the rendered body. This is the
 *    equivalence axis: a transformation that changes the markup is not a speedup, and the gate
 *    treats any fingerprint change as a failure until the baseline is deliberately updated.
 * 3. **Garbage collector share.** Roughly a quarter of SSR time is GC, so allocation is a
 *    first-class cost. Without this axis a change that trades CPU for allocation reads as a win.
 *
 * Usage:
 *   bun run bench:ssr              report + gate against src/lib/test/perf/ssr-baseline.json
 *   bun run bench:ssr -- --update  rewrite the baseline from this run
 *   bun run bench:ssr -- --no-gate report only (use on a machine that did not record the baseline)
 *
 * The µs budget is machine-specific and only meaningful against a baseline recorded on the same
 * machine; `--no-gate` exists for that case. The fingerprint axis is machine-independent and is
 * always checked.
 *
 * **The budget cannot prove a small win.** A single machine drifts far more than a good change
 * moves these numbers — a long session of builds and test runs was measured 20% slower end to end,
 * which swamps the 6% a real improvement produced. The budget catches structural losses; to
 * establish that a change helped, interleave two trees so both absorb the same drift:
 *
 * ```bash
 * git worktree add /tmp/before <commit-before-the-change>
 * ln -s "$PWD/node_modules" /tmp/before/node_modules
 * cp src/lib/test/perf/ssr-bench.ts /tmp/before/src/lib/test/perf/   # same harness both sides
 * (cd /tmp/before && bunx svelte-kit sync)
 * for i in 1 2 3; do
 *   (cd /tmp/before && bun run bench:ssr -- --no-gate)
 *   bun run bench:ssr -- --no-gate
 * done   # compare medians, never single runs
 * ```
 */
import { render } from 'svelte/server';
import { createHash } from 'node:crypto';
import { PerformanceObserver } from 'node:perf_hooks';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cpus } from 'node:os';
import Ablation, { type AblationLayer } from './ablation.test.svelte';
import DatagridAblation from './datagrid-ablation.test.svelte';
import TreeAblation from './tree-ablation.test.svelte';
import PresetAblation from './preset-ablation.test.svelte';

/** Layers measured here: the card ladder plus the standalone collection fixture. */
type BenchLayer = AblationLayer | 'datagrid' | 'tree' | 'card-preset';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FIXTURES: Record<BenchLayer, any> = {
	plain: Ablation,
	htmlatom: Ablation,
	card: Ablation,
	collapsible: Ablation,
	datagrid: DatagridAblation,
	tree: TreeAblation,
	'card-preset': PresetAblation
};

/** Standalone layers have their own component and take no `layer` prop. */
function fixtureProps(layer: BenchLayer, n: number): Record<string, unknown> {
	return STANDALONE.includes(layer) ? { n } : { n, layer };
}

const LOW = 100;
const HIGH = 800;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 8);
// 16 rounds rather than 12: the `htmlatom` layer is small enough that 10 measured rounds leave
// ~9% run-to-run spread, which a 10% gate would flap on. The extra rounds cost a few seconds.
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 16);
const WARMUP_ROUNDS = 3;
const GC_WARMUP_MS = Number(process.env.BENCH_GC_WARMUP_MS ?? 120);
const GC_BUDGET_MS = Number(process.env.BENCH_GC_MS ?? 400);

/**
 * Regression tolerance. Within a single run the floored endpoints are stable to ~1%, but the
 * *baseline* is one run's floor and observed cross-run drift on this machine reaches ~11% — enough
 * that a 10% band failed on an unchanged tree. This gate exists to catch structural regressions (a
 * lost fast path, per-instance work reintroduced into the backbone), which show up at 25% or more;
 * it is not a microbenchmark. Prefer three runs and the trend over any single number.
 */
const MICROS_TOLERANCE = 0.15;

/**
 * Absolute allowance added to the relative band, because run-to-run drift is largely *fixed* rather
 * than proportional: across ~19 runs of unchanged code the floors moved by up to ~3 µs on every
 * budgeted layer regardless of its size (`card` 44.7–49.1, `datagrid` 38.2–41.7, `htmlatom`
 * 11.5–14.3). A purely relative band therefore fails the cheapest layer first and for no structural
 * reason — `htmlatom` is the smallest budgeted layer at 11.34 µs, and 15% of that is below its own
 * noise, which is exactly the false failure this gate kept producing.
 *
 * The resulting bands are ~20% on the compound layers and ~41% on `htmlatom`. The wide one is not a
 * concession; it is what this machine can actually resolve for a layer that cheap. Tightening it
 * back only produces failures that say nothing about the code.
 */
const MICROS_ALLOWANCE = 3;

/**
 * GC share is noisier than wall time. 4 points was under the observed spread: `collapsible` reached
 * 24.7% against a 19.1% baseline on unchanged code, tripping the gate on nothing.
 */
const GC_SHARE_TOLERANCE = 0.07;

/**
 * The ablation ladder: same card structure, progressively more machinery, so the delta between two
 * adjacent rows is that rung's cost.
 */
const LADDER: BenchLayer[] = ['plain', 'htmlatom', 'card', 'collapsible'];

/**
 * Layers measured and gated on their own history but NOT part of the ladder, because they render a
 * different structure and a delta against the rung above them would be meaningless. `datagrid`'s
 * unit is a three-cell row, which is the collection shape — one Bond and root Atom per row plus
 * static cell components — that no ladder rung exercises.
 */
const STANDALONE: BenchLayer[] = ['datagrid', 'tree', 'card-preset'];

const LAYERS: BenchLayer[] = [...LADDER, ...STANDALONE];

/**
 * `plain` is the library-free control, not a target. Its marginal cost (~0.27 µs) sits below this
 * harness's resolution, so a percentage budget on it is noise, and its GC share is erratic because
 * the layer is over almost before a collection can be attributed to it. Its *fingerprint* is still
 * gated — if the hand-written control markup changes, every comparison built on it is invalid.
 */
const BUDGETED = new Set<BenchLayer>([
	'htmlatom',
	'card',
	'collapsible',
	'datagrid',
	'tree',
	// The card layer as an application actually renders it: defaultPreset installed. Its delta
	// against `card` is the preset pipeline's per-card cost, which the bare ladder never pays.
	'card-preset'
]);
const BASELINE_PATH = join(process.cwd(), 'src/lib/test/perf/ssr-baseline.json');

const args = new Set(process.argv.slice(2));
const UPDATE = args.has('--update');
const GATE = !args.has('--no-gate') && !UPDATE;

type LayerBaseline = {
	micros: number;
	bytesPerCard: number;
	sha: string;
	gcShare: number;
};
type Baseline = {
	machine: string;
	node: string;
	recorded: string;
	layers: Record<string, LayerBaseline>;
};

function renderMs(layer: BenchLayer, n: number): number {
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		// `body` is a LAZY GETTER in Svelte 5. It must be read inside the timed region, otherwise
		// render() only measures payload setup and the entire component cost escapes measurement.
		if (render(FIXTURES[layer], { props: fixtureProps(layer, n) }).body.length === 0) {
			throw new Error(`empty render for layer "${layer}"`);
		}
	}
	return (performance.now() - start) / ITERATIONS;
}

function fingerprint(layer: BenchLayer): { bytesPerCard: number; sha: string } {
	const body = render(FIXTURES[layer], { props: fixtureProps(layer, 3) }).body;
	return {
		bytesPerCard: Math.round(body.length / 3),
		sha: createHash('sha256').update(body).digest('hex').slice(0, 12)
	};
}

// GC entries reach an observer only through its callback on a later macrotask — `takeRecords()`
// returns nothing while a synchronous render loop is running. So accumulate in the callback and
// yield once after the loop to flush. Trailing GC from the flush itself lands in the same bucket,
// which is what we want: it is still this layer's allocation being collected.
let gcAccumulated = 0;
const gcObserver = new PerformanceObserver((list) => {
	for (const entry of list.getEntries()) gcAccumulated += entry.duration;
});
gcObserver.observe({ entryTypes: ['gc'] });

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function renderFor(layer: BenchLayer, budgetMs: number): number {
	const start = performance.now();
	let elapsed = 0;
	// `body` is a lazy getter; the accumulator both forces it and keeps the read from being
	// treated as a dead expression by the optimiser or the linter.
	let sink = 0;
	do {
		sink += render(FIXTURES[layer], { props: fixtureProps(layer, HIGH) }).body.length;
		elapsed = performance.now() - start;
	} while (elapsed < budgetMs);
	if (sink === 0) throw new Error(`empty render for layer "${layer}"`);
	return elapsed;
}

/**
 * Time-boxed rather than iteration-boxed. A fixed iteration count gives each layer a wildly
 * different wall time — `plain` finishes 24 renders in a few milliseconds — so a single major
 * collection of the *previous* layer's garbage lands in a tiny denominator and reports a share
 * far above 100%. Giving every layer the same wall-clock budget makes the shares comparable, and
 * the warm-up leg drains inherited garbage before the measured leg starts.
 */
async function measureGcShare(layer: BenchLayer): Promise<number> {
	renderFor(layer, GC_WARMUP_MS);
	await flush();
	gcAccumulated = 0;
	const wall = renderFor(layer, GC_BUDGET_MS);
	await flush();
	return wall > 0 ? gcAccumulated / wall : 0;
}

// ─── Measure ───────────────────────────────────────────────────────────────────

// Floor each ENDPOINT across rounds, then take the slope — not the minimum of the per-round
// slopes. The minimum of a difference of two noisy measurements is biased downward by whichever
// round happened to pair a fast HIGH with a slow LOW, which on the `plain` layer (where the true
// delta is ~0.2 ms) is enough to produce a negative result. Flooring the endpoints separately
// removes that pairing artefact and cuts run-to-run spread on the compound layers as well.
const floorLow = new Map<BenchLayer, number>();
const floorHigh = new Map<BenchLayer, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const layer of LAYERS) {
		const low = renderMs(layer, LOW);
		const high = renderMs(layer, HIGH);
		if (round < WARMUP_ROUNDS) continue;
		floorLow.set(layer, Math.min(floorLow.get(layer) ?? Infinity, low));
		floorHigh.set(layer, Math.min(floorHigh.get(layer) ?? Infinity, high));
	}
}

const best = new Map<BenchLayer, number>(
	LAYERS.map((layer) => [
		layer,
		((floorHigh.get(layer)! - floorLow.get(layer)!) * 1000) / (HIGH - LOW)
	])
);

const measured: Record<string, LayerBaseline> = {};
for (const layer of LAYERS) {
	measured[layer] = {
		micros: Number(best.get(layer)!.toFixed(2)),
		gcShare: Number((await measureGcShare(layer)).toFixed(3)),
		...fingerprint(layer)
	};
}

// ─── Report ────────────────────────────────────────────────────────────────────

const baseline = readBaseline();
const plainMicros = measured.plain!.micros;

console.log('\nSSR marginal cost per card (lower is better)\n');
let previous = 0;
for (const layer of LAYERS) {
	const row = measured[layer]!;
	// Standalone layers render a different structure, so a delta and a ×plain index against the
	// ladder would both invite a comparison that is not valid. Print the layer's own numbers only.
	const onLadder = LADDER.includes(layer);
	if (!onLadder) {
		const gc = `${(row.gcShare * 100).toFixed(1).padStart(4)}%`;
		console.log(
			`\n  ${layer.padEnd(11)} ${row.micros.toFixed(2).padStart(7)} µs  ${' '.repeat(8)}` +
				`${(layer === 'tree' ? 'per node' : 'per row').padStart(10)}  gc ${gc}  ` +
				`${String(row.bytesPerCard).padStart(4)} B/unit  sha=${row.sha}${compareNote(layer)}`
		);
		continue;
	}
	const delta = row.micros - previous;
	previous = row.micros;
	// `×plain` indexes each layer against the hand-written control measured in the same run, so
	// the ratio stays comparable across machines even though the microsecond figure does not.
	const index = plainMicros > 0 ? `${(row.micros / plainMicros).toFixed(0)}×plain` : '—';
	// The control's GC share is not a meaningful figure (see BUDGETED) — printing it invites
	// someone to read a 900% into it. Print the axis only where it is gated.
	const gc = BUDGETED.has(layer) ? `${(row.gcShare * 100).toFixed(1).padStart(4)}%` : '   — ';
	console.log(
		`  ${layer.padEnd(11)} ${row.micros.toFixed(2).padStart(7)} µs  +${delta.toFixed(2).padStart(6)}  ` +
			`${index.padStart(10)}  gc ${gc}  ` +
			`${String(row.bytesPerCard).padStart(4)} B/card  sha=${row.sha}${compareNote(layer)}`
	);
}
console.log('');

if (UPDATE) {
	const next: Baseline = {
		machine: `${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}`,
		node: process.version,
		recorded: new Date().toISOString().slice(0, 10),
		layers: measured
	};
	writeFileSync(BASELINE_PATH, JSON.stringify(next, null, '\t') + '\n');
	console.log(`baseline updated → ${BASELINE_PATH}\n`);
	process.exit(0);
}

if (!baseline) {
	console.log('no baseline recorded — run with `-- --update` to record one\n');
	process.exit(0);
}

// ─── Gate ──────────────────────────────────────────────────────────────────────

const failures: string[] = [];
for (const layer of LAYERS) {
	const now = measured[layer]!;
	const was = baseline.layers[layer];
	if (!was) {
		failures.push(`${layer}: no baseline entry`);
		continue;
	}
	// Output equivalence first: a markup change invalidates every timing comparison below it.
	if (now.sha !== was.sha || now.bytesPerCard !== was.bytesPerCard) {
		failures.push(
			`${layer}: output changed — ${was.bytesPerCard} B/sha=${was.sha} → ${now.bytesPerCard} B/sha=${now.sha}`
		);
	}
	if (!BUDGETED.has(layer)) continue;
	const budget = was.micros * (1 + MICROS_TOLERANCE) + MICROS_ALLOWANCE;
	if (GATE && now.micros > budget) {
		failures.push(
			`${layer}: ${now.micros.toFixed(2)} µs exceeds budget ` +
				`${budget.toFixed(2)} µs (baseline ${was.micros.toFixed(2)})`
		);
	}
	if (GATE && now.gcShare > was.gcShare + GC_SHARE_TOLERANCE) {
		failures.push(
			`${layer}: gc share ${(now.gcShare * 100).toFixed(1)}% exceeds ` +
				`${((was.gcShare + GC_SHARE_TOLERANCE) * 100).toFixed(1)}% (baseline ${(was.gcShare * 100).toFixed(1)}%)`
		);
	}
}

/**
 * A per-layer band cannot see a backbone regression that is smaller than one layer's noise but
 * present in all of them. A change to the shared presentation path did exactly that: every budgeted
 * layer moved up together (card +12%, datagrid +13%, collapsible +6%, tree +5%) while each stayed
 * inside its own budget, and it was only caught by an interleaved A/B against reverted sources.
 *
 * Layers drift independently, so a shared direction is information a single layer's number is not.
 * It is not proof — machine load also lifts everything at once — so this warns and names the one
 * procedure that can tell the two apart, rather than failing on an ambiguous signal.
 */
const drifted = [...BUDGETED]
	.map((layer) => {
		const was = baseline.layers[layer];
		return was ? (measured[layer]!.micros - was.micros) / was.micros : 0;
	})
	.filter((change) => change > 0.04);

if (drifted.length === BUDGETED.size) {
	const median = drifted.sort((a, b) => a - b)[drifted.length >> 1]!;
	console.warn(
		`  ! every budgeted layer regressed together (median +${(median * 100).toFixed(0)}%).\n` +
			'    Either machine load or a change to the shared backbone — a per-layer budget cannot\n' +
			'    tell those apart. Revert your change and re-run 3× to compare medians before trusting\n' +
			'    an individual number.\n'
	);
}

if (failures.length > 0) {
	console.error('bench:ssr gate FAILED');
	for (const failure of failures) console.error(`  ✗ ${failure}`);
	console.error(
		`\nbaseline recorded ${baseline.recorded} on ${baseline.machine} (${baseline.node}).` +
			'\nRe-run with `-- --no-gate` on a different machine, or `-- --update` to accept these numbers.\n'
	);
	process.exit(1);
}

console.log(`gate OK — baseline ${baseline.recorded}, ${baseline.machine}\n`);

function readBaseline(): Baseline | undefined {
	try {
		return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
	} catch {
		return undefined;
	}
}

function compareNote(layer: BenchLayer): string {
	const was = baseline?.layers[layer];
	if (!was) return '';
	const change = ((measured[layer]!.micros - was.micros) / was.micros) * 100;
	if (Math.abs(change) < 1) return '';
	return `  ${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
}
