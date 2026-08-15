/**
 * Ceiling spike — how much could a conditional fast path inside each part win on a Card?
 *
 * Produces a number, not a feature. Run: `bun run bench:ceiling`.
 *
 * Method is `../ssr-bench.ts`'s: read `.body` inside the timed region (it is a lazy getter), floor
 * each ENDPOINT across rounds before taking the slope, interleave arms so drift hits all of them,
 * and collect before each timed region because this fixture is allocation-bound.
 */
import { render } from 'svelte/server';
import { createHash } from 'node:crypto';
import { cpus } from 'node:os';
import Ceiling, { type CeilingArm } from './ceiling-ablation.test.svelte';

const ARMS: CeilingArm[] = ['plain', 'fast', 'card', 'fast-root', 'card-root'];

const LOW = 100;
const HIGH = 800;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 2);
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 40);
const WARMUP = 5;

/** Exact integer arithmetic, so the anchor axis uses counts small enough to stay cheap. */
const ANCHOR_LOW = 4;
const ANCHOR_HIGH = 12;

const body = (arm: CeilingArm, n: number) => render(Ceiling, { props: { n, arm } }).body;

const stripComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');
const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 12);

// ─── Equivalence ────────────────────────────────────────────────────────────────────────────────

// `fast` must render the same PAGE as `card` — same elements, classes, ids, text. Anchors are
// reported separately rather than required to match: they are a property of the render path, and a
// change in them is a result (less DOM mass), not a defect. `plain` is the library-free floor and is
// deliberately NOT equivalent — it carries no ids and no preset classes, which is the point of it.
// Two classes, compared within themselves. `<Root>` renders its own page wrapper, so a Root-wrapped
// arm can never equal a bare one — but that wrapper is fixed cost and cancels out of a marginal
// slope, so the pairing that matters is fast-vs-real at the same wrapping.
const CLASSES: [CeilingArm, CeilingArm][] = [
	['card', 'fast'],
	['card-root', 'fast-root']
];

let failed = false;
for (const [real, fast] of CLASSES) {
	const want = stripComments(body(real, 3));
	const got = stripComments(body(fast, 3));
	if (want === got) {
		console.log(
			`\nequivalence OK — \`${fast}\` renders the same page as \`${real}\` (sha=${sha(want)})`
		);
		continue;
	}
	failed = true;
	console.error(
		`\nceiling spike ABORTED — \`${fast}\` does not render the same page as \`${real}\`:`
	);
	console.error(`  ${real.padEnd(10)} ${want.length} B  sha=${sha(want)}`);
	console.error(`  ${fast.padEnd(10)} ${got.length} B  sha=${sha(got)}`);
	const a = stripComments(body(real, 1));
	const b = stripComments(body(fast, 1));
	let i = 0;
	while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
	console.error(`\n  first divergence at ${i}:`);
	console.error(`    ${real.padEnd(10)} …${a.slice(Math.max(0, i - 40), i + 90)}`);
	console.error(`    ${fast.padEnd(10)} …${b.slice(Math.max(0, i - 40), i + 90)}\n`);
}
if (failed) process.exit(1);
console.log('');

// ─── Shape ──────────────────────────────────────────────────────────────────────────────────────

const anchors = (arm: CeilingArm, n: number) => (body(arm, n).match(/<!--/g) ?? []).length;
const shapeOf = new Map<CeilingArm, { bytes: number; anchors: number }>();
for (const arm of ARMS) {
	const span = ANCHOR_HIGH - ANCHOR_LOW;
	shapeOf.set(arm, {
		bytes: (body(arm, ANCHOR_HIGH).length - body(arm, ANCHOR_LOW).length) / span,
		anchors: (anchors(arm, ANCHOR_HIGH) - anchors(arm, ANCHOR_LOW)) / span
	});
}

// ─── Timing ─────────────────────────────────────────────────────────────────────────────────────

function renderMs(arm: CeilingArm, n: number): number {
	(globalThis as { gc?: () => void }).gc?.();
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		if (render(Ceiling, { props: { n, arm } }).body.length === 0) {
			throw new Error(`empty render for ${arm}`);
		}
	}
	return (performance.now() - start) / ITERATIONS;
}

const floor = new Map<string, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const n of [LOW, HIGH]) {
		for (const arm of ARMS) {
			const ms = renderMs(arm, n);
			if (round < WARMUP) continue;
			const key = `${arm}:${n}`;
			floor.set(key, Math.min(floor.get(key) ?? Infinity, ms));
		}
	}
}

const micros = (arm: CeilingArm) =>
	((floor.get(`${arm}:${HIGH}`)! - floor.get(`${arm}:${LOW}`)!) * 1000) / (HIGH - LOW);

// ─── Report ─────────────────────────────────────────────────────────────────────────────────────

const pct = (x: number, base: number) => `${(((x - base) / base) * 100).toFixed(0)}%`;

console.log('marginal SSR cost per card, defaultPreset installed (lower is better)\n');
console.log('  arm          µs/card   vs card   B/card   anchors/card');
for (const arm of ARMS) {
	const s = shapeOf.get(arm)!;
	const vs = arm === 'card' ? '—' : pct(micros(arm), micros('card'));
	console.log(
		`  ${arm.padEnd(11)} ${micros(arm).toFixed(2).padStart(7)}  ${vs.padStart(8)}  ` +
			`${String(Math.round(s.bytes)).padStart(7)}  ${s.anchors.toFixed(1).padStart(12)}`
	);
}

const saving = (from: CeilingArm, to: CeilingArm) =>
	`${(((micros(from) - micros(to)) / micros(from)) * 100).toFixed(0)}%`;

console.log(`
  ceiling, bare card       card → fast          ${saving('card', 'fast')}  (${(micros('card') - micros('fast')).toFixed(2)} µs)
  ceiling, production      card-root → fast-root ${saving('card-root', 'fast-root')}  (${(micros('card-root') - micros('fast-root')).toFixed(2)} µs)
  cost of the Root slot    card → card-root      ${pct(micros('card-root'), micros('card'))}  (${(micros('card-root') - micros('card')).toFixed(2)} µs)
  irreducible in fast      fast → plain          ${(micros('fast') - micros('plain')).toFixed(2)} µs (preset lookup + id + class merge)
`);

console.log(
	`  ${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}, ${process.version}, ` +
		`${ROUNDS - WARMUP} measured rounds × ${ITERATIONS} iterations, arms interleaved.\n` +
		'  ~11% run-to-run drift on this machine: run 3× and compare medians.\n'
);
