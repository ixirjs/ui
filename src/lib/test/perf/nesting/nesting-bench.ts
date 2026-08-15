/**
 * Nested components vs nested module snippets — the SSR half. Run with `bun run bench:nesting`.
 *
 * The question: at nesting depth D with props flowing down, what does a component boundary cost
 * against a `{@render}` of a cross-file module snippet? The library already bet on the snippet
 * (Kernel's direct snippet dispatch) and measured the win once, on Card; this measures the
 * seam itself, at depth, on four axes. Four arms, a 2×2 over seam × calling convention — see
 * `types.ts`, and read a column for the seam rather than picking two arms across the diagonal.
 *
 * Method follows `../ssr-bench.ts` — it solved the hard parts and its comments say why:
 *   - `.body` is a LAZY GETTER; read it inside the timed region or you measure nothing.
 *   - Floor each ENDPOINT across rounds, then take the slope. The minimum of per-round slopes is
 *     biased downward by whichever round paired a fast HIGH with a slow LOW.
 *   - Arms interleave within every round so machine drift hits both equally. This is what makes a
 *     same-run A/B legitimate; never compare two separate runs of this file.
 *
 * Report only — no baseline, no gate. The one hard failure is markup equivalence: every arm must
 * render byte-identical HTML once comments are stripped, or the numbers compare different pages.
 *
 * On this fixture the arms turn out identical INCLUDING the comments — 27 anchors per unit, 3 per
 * level, all four. That is the first result and it is a negative one: a component boundary is free
 * on the anchor axis (`docs/research/hydration-anchor-diet-2026-08.md` says as much — "boundaries
 * are free"), and the +2 that table charges for children through a boundary is paid by BOTH seams,
 * because a snippet's body is dispatched through the same optional-callee render tag. So the
 * comment-stripping in the equivalence check is belt-and-braces rather than load-bearing here, and
 * the entire component-vs-snippet difference on the server is time and allocation.
 */
import { render } from 'svelte/server';
import { createHash } from 'node:crypto';
import { PerformanceObserver } from 'node:perf_hooks';
import { cpus } from 'node:os';
import Nesting from './nesting-ablation.test.svelte';
import type { NestingArm } from './types';

const ARMS: NestingArm[] = ['component', 'component-spread', 'snippet', 'snippet-packet'];
/** Everything is reported against this arm — the idiomatic explicit-props component chain. */
const BASE: NestingArm = 'component';

/** Units per render. The µs figures are slopes between these, so fixed render setup cancels. */
const LOW = 100;
const HIGH = 800;
/** Levels per unit. The headline number is the slope between these — cost of one nesting level. */
const SHALLOW = 2;
const DEEP = 8;

// Shorter samples, more of them, than `../ssr-bench.ts`'s 8×16 — see `renderMs` for why. The run
// takes about the same wall time either way.
const ITERATIONS = Number(process.env.BENCH_ITER ?? 2);
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 45);
const WARMUP_ROUNDS = 5;
/** The GC leg is boxed by render count so every arm collects the garbage of the same work. */
const GC_WARMUP_RENDERS = Number(process.env.BENCH_GC_WARMUP_RENDERS ?? 20);
const GC_RENDERS = Number(process.env.BENCH_GC_RENDERS ?? 80);

/** The anchor axis is exact integer arithmetic, so it uses counts small enough to stay cheap. */
const ANCHOR_LOW = 4;
const ANCHOR_HIGH = 12;

type Point = { n: number; depth: number };
const GRID: Point[] = [
	{ n: LOW, depth: SHALLOW },
	{ n: HIGH, depth: SHALLOW },
	{ n: LOW, depth: DEEP },
	{ n: HIGH, depth: DEEP }
];

const key = (arm: NestingArm, p: Point) => `${arm}:${p.n}:${p.depth}`;

function props(arm: NestingArm, n: number, depth: number) {
	return { n, arm, depth, tint: 't0', deep: 0 };
}

function body(arm: NestingArm, n: number, depth: number): string {
	return render(Nesting, { props: props(arm, n, depth) }).body;
}

// ─── Equivalence: run first, because it decides whether anything else means something ──────────

const stripComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');
const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 12);

const shapes = ARMS.map((arm) => {
	const raw = body(arm, 3, DEEP);
	const stripped = stripComments(raw);
	return { arm, raw, stripped, rawSha: sha(raw), strippedSha: sha(stripped) };
});

if (shapes.some((s) => s.strippedSha !== shapes[0]!.strippedSha)) {
	console.error('nesting bench ABORTED — the arms do not render the same markup.\n');
	for (const s of shapes) {
		console.error(`  ${s.arm.padEnd(10)} ${s.stripped.length} B  sha=${s.strippedSha}`);
	}
	console.error(
		'\nComment anchors are the expected difference and are stripped before this comparison.' +
			'\nA difference in real markup means the fixtures diverged: `nesting-level.svelte` and the' +
			'\n`level` snippet in `nesting-levels.svelte` must emit identical elements, classes and text.\n'
	);
	// eslint-disable-next-line no-undef
	process.exit(1);
}

console.log(
	`\nmarkup equivalence OK — all ${ARMS.length} arms sha=${shapes[0]!.strippedSha} ` +
		`(${shapes[0]!.stripped.length} B comment-free at n=3, depth=${DEEP})\n`
);

// ─── Fingerprint and anchors: exact, machine-independent ────────────────────────────────────────

const countAnchors = (arm: NestingArm, n: number, depth: number) =>
	(body(arm, n, depth).match(/<!--/g) ?? []).length;

type Shape = {
	bytesPerUnit: number;
	commentBytesPerUnit: number;
	anchorsPerUnit: number;
	anchorsPerLevel: number;
	sha: string;
};

const shapeOf = new Map<NestingArm, Shape>();
for (const arm of ARMS) {
	const lo = body(arm, ANCHOR_LOW, DEEP);
	const hi = body(arm, ANCHOR_HIGH, DEEP);
	const span = ANCHOR_HIGH - ANCHOR_LOW;
	const anchorsPerUnit =
		(countAnchors(arm, ANCHOR_HIGH, DEEP) - countAnchors(arm, ANCHOR_LOW, DEEP)) / span;
	// Second slope, over DEPTH at a fixed unit count: the per-level cost the ladder is here to find.
	const shallow = countAnchors(arm, ANCHOR_HIGH, SHALLOW);
	const deep = countAnchors(arm, ANCHOR_HIGH, DEEP);
	shapeOf.set(arm, {
		bytesPerUnit: (hi.length - lo.length) / span,
		commentBytesPerUnit:
			(hi.length - stripComments(hi).length - (lo.length - stripComments(lo).length)) / span,
		anchorsPerUnit,
		anchorsPerLevel: (deep - shallow) / ((DEEP - SHALLOW) * ANCHOR_HIGH),
		sha: sha(hi)
	});
}

// ─── Timing ─────────────────────────────────────────────────────────────────────────────────────

/**
 * Collect BEFORE the timed region, never inside it.
 *
 * This fixture is allocation-bound in a way `../ssr-bench.ts`'s is not: a unit here costs a few µs
 * but emits ~830 B, so 60–88% of wall time is GC and a single major collection landing inside a
 * timed region moves that sample by more than the effect being measured. Flooring across rounds is
 * supposed to filter exactly that, but at eight renders per sample nearly every sample contained a
 * collection, so the floor was a floor over noise — the `component` arm swung 0.42–0.99 µs/level
 * across three runs of unchanged code, wider than its distance from the snippet arm.
 *
 * Draining first, and taking more but shorter samples, gives the floor real GC-free rounds to find.
 */
function renderMs(arm: NestingArm, p: Point): number {
	(globalThis as { gc?: () => void }).gc?.();
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		// `body` is a LAZY GETTER in Svelte 5. Reading it inside the timed region is the whole
		// measurement; without the read, render() only builds the payload.
		if (render(Nesting, { props: props(arm, p.n, p.depth) }).body.length === 0) {
			throw new Error(`empty render for ${key(arm, p)}`);
		}
	}
	return (performance.now() - start) / ITERATIONS;
}

const floor = new Map<string, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const p of GRID) {
		// Arms interleave at the innermost level so a thermal or scheduler excursion lands on both.
		for (const arm of ARMS) {
			const ms = renderMs(arm, p);
			if (round < WARMUP_ROUNDS) continue;
			const k = key(arm, p);
			floor.set(k, Math.min(floor.get(k) ?? Infinity, ms));
		}
	}
}

const at = (arm: NestingArm, n: number, depth: number) => floor.get(`${arm}:${n}:${depth}`)!;

// ─── GC share ───────────────────────────────────────────────────────────────────────────────────

// GC entries reach an observer only through its callback on a later macrotask — `takeRecords()`
// returns nothing while a synchronous render loop runs. Accumulate in the callback, yield once
// after the loop to flush.
let gcAccumulated = 0;
new PerformanceObserver((list) => {
	for (const entry of list.getEntries()) gcAccumulated += entry.duration;
}).observe({ entryTypes: ['gc'] });

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function renderBurst(arm: NestingArm, renders: number): number {
	const start = performance.now();
	// The accumulator both forces the lazy getter and keeps the read from being folded away.
	let sink = 0;
	for (let i = 0; i < renders; i++) {
		sink += render(Nesting, { props: props(arm, HIGH, DEEP) }).body.length;
	}
	if (sink === 0) throw new Error(`empty render for ${arm}`);
	return performance.now() - start;
}

/**
 * Two GC numbers, because one cannot answer both questions this benchmark asks.
 *
 * `share` is GC as a fraction of that arm's own render time — how much of ITS cost is collection.
 * `nsPerUnit` is GC time divided by units rendered, which is the only figure that compares arms.
 *
 * The leg is boxed by RENDER COUNT, not wall time as `../ssr-bench.ts` does. That harness compares
 * layers of similar cost, where equal wall time is close enough to equal work; here the arms differ
 * by up to 7× per level, so a time-boxed leg would let the fast arm render several times as many
 * units and then charge it for the garbage they made. Equal renders means equal units means the
 * allocation figures are directly comparable.
 *
 * Caveat that applies to both: node's GC entries can overlap on background threads, so a summed
 * duration is an upper bound and a share above ~50% should be read as "allocation-bound", not as a
 * precise fraction. The per-unit figure is the one to compare; the share is context.
 */
async function measureGc(arm: NestingArm): Promise<{ share: number; nsPerUnit: number }> {
	renderBurst(arm, GC_WARMUP_RENDERS);
	await flush();
	gcAccumulated = 0;
	const wall = renderBurst(arm, GC_RENDERS);
	await flush();
	return {
		share: wall > 0 ? gcAccumulated / wall : 0,
		nsPerUnit: (gcAccumulated * 1e6) / (GC_RENDERS * HIGH)
	};
}

const gc = new Map<NestingArm, { share: number; nsPerUnit: number }>();
for (const arm of ARMS) gc.set(arm, await measureGc(arm));

// ─── Report ─────────────────────────────────────────────────────────────────────────────────────

/** Cost of ONE nesting level, per unit: the depth slope at the high unit count. */
const perLevel = (arm: NestingArm) =>
	((at(arm, HIGH, DEEP) - at(arm, HIGH, SHALLOW)) * 1000) / ((DEEP - SHALLOW) * HIGH);
/** Cost of one whole unit at full depth: the unit slope. Cross-check on `perLevel`. */
const perUnit = (arm: NestingArm, depth: number) =>
	((at(arm, HIGH, depth) - at(arm, LOW, depth)) * 1000) / (HIGH - LOW);

const pct = (x: number, base: number) =>
	base === 0 ? '    —' : `${x > base ? '+' : ''}${(((x - base) / base) * 100).toFixed(0)}%`;
const f = (x: number, w = 8, d = 3) => x.toFixed(d).padStart(w);

console.log(`SSR — ${HIGH} units × ${DEEP} levels, slopes over both axes (lower is better)\n`);
console.log(
	`  arm                µs/level   vs base    µs/unit@${DEEP}   µs/unit@${SHALLOW}   ` +
		'gc%   gc ns/unit    B/unit  anchors/unit  anchors/level'
);
for (const arm of ARMS) {
	const s = shapeOf.get(arm)!;
	const g = gc.get(arm)!;
	console.log(
		`  ${arm.padEnd(16)} ${f(perLevel(arm))}  ${pct(perLevel(arm), perLevel(BASE)).padStart(8)}  ` +
			`${f(perUnit(arm, DEEP))}  ${f(perUnit(arm, SHALLOW))}  ` +
			`${(g.share * 100).toFixed(1).padStart(5)}%  ${f(g.nsPerUnit, 10, 0)}  ` +
			`${String(Math.round(s.bytesPerUnit)).padStart(8)}  ${f(s.anchorsPerUnit, 12, 1)}  ${f(s.anchorsPerLevel, 13, 1)}`
	);
}

// The equivalence check already proved the arms emit identical markup, so bytes and anchors are
// identical by construction — printed to make the "no structural difference" half of the result
// visible rather than to compare. On SSR the whole difference is time and allocation.
console.log(
	`\n  ${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}, ${process.version}, ` +
		`${ROUNDS - WARMUP_ROUNDS} measured rounds × ${ITERATIONS} iterations.\n` +
		'  This machine drifts ~11% run to run. Run 3× and compare medians; a difference smaller\n' +
		'  than that is below this harness’s resolution and should be reported as such.\n'
);
