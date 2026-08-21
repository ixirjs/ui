/**
 * Head-to-head SSR benchmark: `@ixirjs/ui` against shadcn-svelte / bits-ui on the same fixture
 * shape. Run with `bun run bench:vs-shadcn`.
 *
 *   bun run bench:vs-shadcn                # full report
 *   bun run bench:vs-shadcn -- --json      # machine-readable, for the write-up
 *   bun run bench:vs-shadcn -- card table  # one or more families
 *
 * Method, and why each piece is there:
 *
 * - **Slope, not total.** Every figure is the difference between two instance counts divided by the
 *   difference in count, so per-page fixed setup (a Root, a portal host, a `<table>` wrapper)
 *   cancels and what remains is the marginal cost of one unit.
 * - **Interleaved at the innermost loop.** The two sides alternate within a round, so thermal drift
 *   and background load hit both equally. A-then-B is the classic false win here.
 * - **Floored endpoints, then subtract.** Flooring the two endpoints separately, rather than taking
 *   the minimum of per-round slopes, avoids the downward bias of pairing a fast HIGH with a slow
 *   LOW. Same reasoning as `ssr-bench.ts`.
 * - **Spread reported, not just the median.** The IQR of per-round slopes is printed beside every
 *   figure. A win narrower than the spread is not a win.
 * - **Output census, always.** Bytes, hydration anchors and elements per unit, plus a tag/ARIA
 *   skeleton. Two libraries cannot render byte-identical HTML — different class strings, different
 *   `data-*` — so the parity claim rests on the SKELETON matching, and every byte difference is
 *   reported rather than assumed away. A family whose skeletons differ prints `≠` and the reason
 *   belongs in the write-up, not in a silent pass.
 */
import { render } from 'svelte/server';
import { PerformanceObserver } from 'node:perf_hooks';
import { readFileSync } from 'node:fs';
import { cpus, loadavg } from 'node:os';
import { census, type Census } from './dom.js';
import { FAMILIES, type Family } from './families.js';

const SIDES = ['ixir', 'shadcn'] as const;
type Side = (typeof SIDES)[number];

const LOW = 100;
const HIGH = 800;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 8);
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 16);
const WARMUP_ROUNDS = 3;
const GC_WARMUP_MS = Number(process.env.BENCH_GC_WARMUP_MS ?? 120);
const GC_BUDGET_MS = Number(process.env.BENCH_GC_MS ?? 400);
/** Census slope endpoints. Small, because output is deterministic — one render each is enough. */
const CENSUS_LOW = 2;
const CENSUS_HIGH = 12;

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const only = new Set(args.filter((arg) => !arg.startsWith('--')));
const families = only.size > 0 ? FAMILIES.filter((f) => only.has(f.name)) : FAMILIES;
if (families.length === 0) throw new Error(`no such family: ${[...only].join(', ')}`);

// ─── Timing ────────────────────────────────────────────────────────────────────────────────────

function renderMs(family: Family, side: Side, n: number): number {
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		// `body` is a LAZY GETTER. Reading it outside the timed region measures payload setup only
		// and the entire component cost escapes measurement.
		if (render(family[side], { props: { n } }).body.length === 0) {
			throw new Error(`empty render: ${family.name}/${side}`);
		}
	}
	return (performance.now() - start) / ITERATIONS;
}

type Key = `${string}:${Side}`;
const key = (family: Family, side: Side): Key => `${family.name}:${side}`;

const floorLow = new Map<Key, number>();
const floorHigh = new Map<Key, number>();
const slopes = new Map<Key, number[]>();

for (let round = 0; round < ROUNDS; round++) {
	for (const family of families) {
		for (const side of SIDES) {
			const low = renderMs(family, side, LOW);
			const high = renderMs(family, side, HIGH);
			if (round < WARMUP_ROUNDS) continue;
			const k = key(family, side);
			floorLow.set(k, Math.min(floorLow.get(k) ?? Infinity, low));
			floorHigh.set(k, Math.min(floorHigh.get(k) ?? Infinity, high));
			(slopes.get(k) ?? slopes.set(k, []).get(k)!).push(((high - low) * 1000) / (HIGH - LOW));
		}
	}
}

// ─── Garbage collector share ───────────────────────────────────────────────────────────────────

let gcAccumulated = 0;
new PerformanceObserver((list) => {
	for (const entry of list.getEntries()) gcAccumulated += entry.duration;
}).observe({ entryTypes: ['gc'] });

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function renderFor(family: Family, side: Side, budgetMs: number): number {
	const start = performance.now();
	let elapsed = 0;
	let sink = 0;
	do {
		sink += render(family[side], { props: { n: HIGH } }).body.length;
		elapsed = performance.now() - start;
	} while (elapsed < budgetMs);
	if (sink === 0) throw new Error(`empty render: ${family.name}/${side}`);
	return elapsed;
}

async function gcShare(family: Family, side: Side): Promise<number> {
	renderFor(family, side, GC_WARMUP_MS);
	await flush();
	gcAccumulated = 0;
	const wall = renderFor(family, side, GC_BUDGET_MS);
	await flush();
	return wall > 0 ? gcAccumulated / wall : 0;
}

// ─── Census ────────────────────────────────────────────────────────────────────────────────────

/** Per-unit census: the slope between two instance counts, so the page wrapper cancels. */
function censusPerUnit(family: Family, side: Side): Census & { unitSkeleton: string } {
	const low = census(render(family[side], { props: { n: CENSUS_LOW } }).body);
	const high = census(render(family[side], { props: { n: CENSUS_HIGH } }).body);
	const span = CENSUS_HIGH - CENSUS_LOW;
	const per = (pick: (c: Census) => number) => (pick(high) - pick(low)) / span;
	// The skeleton of ONE unit: what the extra units added, deduplicated. Comparing whole-page
	// skeletons would drown a per-unit difference in the wrapper.
	const repeated = high.skeleton.split('>').slice(low.skeleton.split('>').length);
	return {
		bytes: per((c) => c.bytes),
		comments: per((c) => c.comments),
		commentBytes: per((c) => c.commentBytes),
		elements: per((c) => c.elements),
		skeleton: low.skeleton,
		unitSkeleton: repeated.slice(0, Math.round(per((c) => c.elements))).join('>')
	};
}

// ─── Collect ───────────────────────────────────────────────────────────────────────────────────

type Row = {
	micros: number;
	spread: [number, number];
	gcShare: number;
	census: Census & { unitSkeleton: string };
};

const results: Record<string, Record<Side, Row>> = {};
for (const family of families) {
	results[family.name] = {} as Record<Side, Row>;
	for (const side of SIDES) {
		const k = key(family, side);
		const sorted = [...slopes.get(k)!].sort((a, b) => a - b);
		results[family.name]![side] = {
			micros: ((floorHigh.get(k)! - floorLow.get(k)!) * 1000) / (HIGH - LOW),
			spread: [
				sorted[Math.floor(sorted.length * 0.25)]!,
				sorted[Math.floor(sorted.length * 0.75)]!
			],
			gcShare: await gcShare(family, side),
			census: censusPerUnit(family, side)
		};
	}
}

const provenance = JSON.parse(readFileSync('bench/vs-shadcn/provenance.json', 'utf8'));
const machine = {
	cpu: `${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}`,
	node: process.version,
	rounds: ROUNDS - WARMUP_ROUNDS,
	iterations: ITERATIONS,
	// Recorded, and warned about below. A run of this harness on a box already at load 11 of 16
	// reported `card` at 76 µs against the 12 µs the same tree gives on an idle one — a 6× inflation
	// that no amount of flooring or interleaving removes, because the competing work is not this
	// process's. Ratios survive load better than absolutes, but not reliably: the same pair read
	// +107% idle and +164% loaded. Provenance without this field is provenance that lies.
	loadavg: loadavg()[0] ?? 0
};

if (JSON_OUT) {
	console.log(JSON.stringify({ machine, provenance, results }, null, '\t'));
	process.exit(0);
}

// ─── Report ────────────────────────────────────────────────────────────────────────────────────

const f = (x: number, w: number, d = 2) => x.toFixed(d).padStart(w);
/** `hand` families oppose a hand-written control, not shadcn — say so in the column. */
const label = (family: Family, side: Side) =>
	side === 'ixir' ? 'ixir' : (family.opponentLabel ?? 'shadcn');
/**
 * A percentage against another library is a verdict; a percentage against hand-written markup is
 * not. A `hand` family's opponent implements none of the behaviour — no keyboard model, no ARIA
 * relationships, no state — so "+66912%" would read as a competitive loss when it is really the
 * price of the component existing at all. Those families report a multiple of the floor instead,
 * which is the same number stripped of the implication.
 */
const verdict = (family: Family, ours: number, theirs: number, spread: number) => {
	if (family.opponent === 'hand') return `${(ours / theirs).toFixed(0)}× floor`;
	const change = ((ours - theirs) / theirs) * 100;
	const inNoise = Math.abs(ours - theirs) < spread;
	return `${change > 0 ? '+' : ''}${change.toFixed(0)}%${inNoise ? '~' : change < 0 ? ' WIN' : ' LOSS'}`;
};

console.log(
	`\n@ixirjs/ui vs shadcn-svelte — SSR marginal cost (lower is better)\n\n` +
		`  shadcn-svelte registry ${provenance.registryHash} (fetched ${provenance.fetched}), ` +
		`bits-ui ${provenance.bitsUi}, svelte ${provenance.svelte}\n` +
		`  ${machine.cpu}, ${machine.node}, ${machine.rounds} measured rounds × ${machine.iterations} iterations, sides interleaved\n` +
		`  1-minute load average ${machine.loadavg.toFixed(2)} of ${cpus().length} cores\n` +
		(machine.loadavg > cpus().length / 4
			? '\n  ! THIS BOX IS BUSY. Absolute µs below are inflated and the ratios are unreliable.\n' +
				'    Quiet the machine and re-run before quoting anything from this table.\n'
			: '')
);

console.log('  family      side    unit          µs/unit   IQR            gc     verdict');
for (const family of families) {
	for (const side of SIDES) {
		const row = results[family.name]![side];
		const other = results[family.name]![side === 'ixir' ? 'shadcn' : 'ixir'];
		const spread = Math.abs(row.spread[1] - row.spread[0]);
		console.log(
			`  ${(side === 'ixir' ? family.name : '').padEnd(11)} ${label(family, side).padEnd(7)} ${family.unit.padEnd(11)} ` +
				`${f(row.micros, 8)}  ±${f(spread / 2, 5)}  ${f(row.gcShare * 100, 6, 1)}%  ` +
				`${side === 'ixir' ? verdict(family, row.micros, other.micros, spread) : ''}`
		);
	}
}

console.log(
	'\n  output census, per unit — anchors are hydration cost, comment bytes are overhead\n'
);
console.log('  family      side     bytes   anchors  anchor B  elements  skeleton');
for (const family of families) {
	const same =
		results[family.name]!.ixir.census.unitSkeleton ===
		results[family.name]!.shadcn.census.unitSkeleton;
	for (const side of SIDES) {
		const c = results[family.name]![side].census;
		console.log(
			`  ${(side === 'ixir' ? family.name : '').padEnd(11)} ${label(family, side).padEnd(7)} ` +
				`${f(c.bytes, 7, 0)}  ${f(c.comments, 8, 1)}  ${f(c.commentBytes, 8, 0)}  ` +
				`${f(c.elements, 8, 1)}  ${same ? '=' : '≠'} ${c.unitSkeleton.slice(0, 84)}`
		);
	}
}
console.log(
	'\n  `=` means the two sides render the same tag/ARIA skeleton for one unit; `≠` means they do\n' +
		'  not, and the difference is described in docs/research/perf-vs-shadcn-2026-08.md. `~` on a\n' +
		'  verdict means the gap is inside the round-to-round spread and is not a result. `× floor`\n' +
		'  means the opponent is hand-written markup with none of the behaviour, not a rival library.\n'
);
