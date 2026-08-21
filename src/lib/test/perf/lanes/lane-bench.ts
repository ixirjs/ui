/**
 * Lane A/B — what the class-only lane is worth, measured on ONE fixture.
 *
 * The card and collapsible SSR profiles show the two Kernel lanes costing very different amounts,
 * but they are different components: that comparison classifies the difference, it cannot size it.
 * This harness renders the same `card.title` slot through each lane, asserts the two arms emit
 * identical bytes, and only then times them. One title per card (`title` is a single-node part, so
 * the registry rejects a second), and the surround is one Card.Root which takes the node lane in
 * both arms — so the arm delta is exactly one part's lane cost.
 *
 * Method mirrors `lazy-bench.ts`: floored samples at two instance counts, slope between them, so
 * page-level constant cost cancels and the number is marginal cost per card.
 *
 * Recorded on first run, 2026-08-16, AMD Ryzen 9 PRO 8945HS:
 *   element  15.35 µs/card    node  8.47 µs/card    ratio 0.552
 * i.e. resolving one presentation-only part through full presentation costs ~6.9 µs more than the
 * class-only lane. That gap is what unifying the lanes is for.
 *
 * FIVE arms, because the first two-arm reading conflated four separate costs. Two arms cannot
 * attribute; they can only subtract. Mean of four runs, same machine, after `definePart` reached
 * the class-only lane — every arm byte-identical, which the equality check above enforces:
 *
 *   direct      7.82 µs   8 anchors   hand-authored module-scope plan + node, plain import
 *   node        8.31 µs  10 anchors   the same part reached as `Card.Title`
 *   inlinePlan  8.67 µs   8 anchors   `direct`, with `Kernel.plan` moved into the instance script
 *   element     9.64 µs   8 anchors   the same part authored through `definePart`
 *   escalated  15.76 µs  14 anchors   `Card.Title` + one rich prop → `richBranch` → `RichPart`
 *
 * Each step isolates exactly one cost:
 *   +0.5 µs / +2 anchors  (node − direct) namespace access. `Card.Title` is a MEMBER EXPRESSION, so
 *                         the compiler treats it as a dynamic component and wraps its output in a
 *                         fragment boundary. Nothing to do with Kernel — it is the barrel API.
 *   +0.9 µs / +0 anchors  (inlinePlan − direct) resolving the plan per component INSTANCE instead
 *                         of once in `<script module>`. The plan cache hits; this is the key build
 *                         and the two map lookups around it.
 *   +1.0 µs / +0 anchors  (element − inlinePlan) what `definePart` itself adds on top: the options
 *                         literal, the `Kernel.node` options object, the source thunk.
 *   +7.5 µs / +4 anchors  (escalated − node) THE BRIDGE, as it was. A consumer prop in
 *                         PRESENTATION_PROP_NAMES/MOTION_PROP_NAMES mounted `RichPart`, a component
 *                         whose only job was to reopen an init context so the presentation could be
 *                         resolved — landing the part back at roughly what EVERY definePart part
 *                         cost before the lane unification, plus four hydration anchors.
 *
 * `KernelNode` now asks the same question in its constructor, where building the element is legal,
 * so that split resolves into its two halves:
 *
 *   escalated  13.30 µs  10 anchors   (was 15.76 / 14)
 *
 *   −2.5 µs / −4 anchors  the bridge, gone. The escalated arm emits bytes identical to the class
 *                         lane and renders through the same leaf; `anchor-budget.spec.ts` pins the
 *                         two at the same number, which is what keeps the decision out of the
 *                         render pass. `RichPart` remains only for props that turn rich AFTER init.
 *   +5.0 µs               presentation resolution itself — real work the consumer asked for by
 *                         passing a prop the class lane cannot express. Not removable here.
 *
 * `inlinePlan` exists because the four-arm reading blamed the whole `definePart` residual on
 * per-instance plan resolution. It is half of it. Do not delete either bisect arm to "simplify"
 * this file — without `escalated` the lane work reads as finished, and without `inlinePlan` the
 * remaining overhead reads as one cause when it is two.
 */
import { render } from 'svelte/server';
import LaneAblation, { type LaneArm } from './lane-ablation.test.svelte';

const ARMS: LaneArm[] = ['element', 'node', 'direct', 'inlinePlan', 'escalated'];
const LOW = 100;
const HIGH = 800;
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 40);
const WARMUP = 5;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 2);

const body = (arm: LaneArm, n: number) => render(LaneAblation, { props: { arm, n } }).body;
const visible = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');

// Equivalence before comparison. The arms must be the same work with the same output; a byte
// difference means the fixture is measuring two different renders and the timing below is void.
const reference = visible(body('node', 3));
for (const arm of ARMS) {
	const candidate = visible(body(arm, 3));
	if (candidate !== reference) {
		const at = [...candidate].findIndex((c, i) => c !== reference[i]);
		throw new Error(
			`lane arm "${arm}" output differs from the node lane at ${at}\n` +
				`  node:    ${reference.slice(Math.max(0, at - 60), at + 60)}\n` +
				`  ${arm}: ${candidate.slice(Math.max(0, at - 60), at + 60)}`
		);
	}
}

// Hydration anchors per card, by arm. The timing above is SSR-only; anchors are the client-side
// proxy — every comment node here is DOM mass the browser allocates and hydration walks.
// Sloped like the timing, so the page's own constant anchors cancel.
const commentCount = (arm: LaneArm, n: number) => body(arm, n).match(/<!--/g)?.length ?? 0;
const anchors = (arm: LaneArm) => (commentCount(arm, 16) - commentCount(arm, 8)) / 8;
console.log('\nlane      µs/card   vs node lane   anchors/card');

function sample(arm: LaneArm, n: number): number {
	(globalThis as { gc?: () => void }).gc?.();
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) void body(arm, n).length;
	return (performance.now() - start) / ITERATIONS;
}

const floor = new Map<string, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const n of [LOW, HIGH]) {
		for (const arm of ARMS) {
			const ms = sample(arm, n);
			if (round < WARMUP) continue;
			const key = `${arm}:${n}`;
			floor.set(key, Math.min(floor.get(key) ?? Infinity, ms));
		}
	}
}

const micros = (arm: LaneArm) =>
	((floor.get(`${arm}:${HIGH}`)! - floor.get(`${arm}:${LOW}`)!) * 1000) / (HIGH - LOW);

const full = micros('element');
const fast = micros('node');

for (const arm of ARMS) {
	console.log(
		`${arm.padEnd(9)} ${micros(arm).toFixed(2).padStart(7)}  ${(micros(arm) / fast).toFixed(3).padStart(11)}  ${anchors(arm).toFixed(2).padStart(13)}`
	);
}
console.log(`\ndelta     ${(full - fast).toFixed(2)} µs per part on the definePart lane`);

/**
 * The gate is an ABSOLUTE budget on the `element` arm, not a ratio between the arms.
 *
 * A ratio gate would invert the moment the lanes unify: once `definePart` reaches the class-only
 * lane, both arms measure the same thing and `node/element` returns to ~1.0 — a passing design
 * would fail a gate written as "node must be cheaper". The budget below instead pins what the
 * definePart lane costs, so it fails on regression in either direction of the work.
 *
 * Calibrated from six runs on 2026-08-16 rather than one, because a single run understates the
 * spread: element measured 15.35, 15.44, 16.88, 15.63, 15.57, 15.86 (median 15.6, ±5%) and node
 * 8.47, 8.38, 9.21, 9.28, 9.53, 8.68. The within-run stability of floored endpoints is ~1%, but
 * run-to-run machine drift is not, and `ssr-bench.ts` documents the same trap. 18.0 sits ~15% over
 * the median: loose enough to survive drift, tight enough that losing the class-only lane for this
 * part (a ~7 µs step) fails it immediately.
 *
 * Tightening condition: after the lane unification lands, the element arm should approach the node
 * arm; re-record both numbers above and lower LANE_BUDGET to the measured element value + 7%.
 */
const BUDGET = Number(process.env.LANE_BUDGET ?? 18.0);
console.log(`gate:     element arm ${full.toFixed(2)} µs/card (budget ≤ ${BUDGET.toFixed(2)})`);
if (!(full <= BUDGET)) {
	console.error(`bench:lanes FAILED — definePart lane costs ${full.toFixed(2)} µs/card`);
	process.exit(1);
}
console.log('bench:lanes OK');
