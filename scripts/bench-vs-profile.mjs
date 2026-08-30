/**
 * Client-side attribution for the head-to-head: CPU-profile ONE mount of one family/side and print
 * the top self-time frames. This is the client analogue of `bun run profile:ssr`, and like it, it
 * is not a benchmark — it says WHERE the time goes; `bench:vs-shadcn:client` says whether it moved.
 *
 *   node scripts/bench-vs-profile.mjs <family> <side> <n> [--cold] [--scale] [--broad]
 *
 * `--broad` profiles the BROAD UPDATE instead of the mount: mount once, then change the one prop
 * every unit reads (`tint`, which each root spreads as its `class`) and flush, repeatedly. That is
 * the axis the head-to-head loses worst on (card +251%, table +198%, §18) and the mount profile
 * cannot see it, because the cost is in re-resolution, not construction.
 *
 * Profile `n` defaults to 2000 for a reason: at a 200 µs sampling interval a 400-unit mount yields
 * ~150 samples, and the top of that list is noise — `needsPresentation` read 10.7% self time at
 * n=400 and under 1% at n=2000, on the same unchanged code. Below ~500 samples, believe the shape
 * of the stack, not the ranking.
 *
 * `--scale` skips profiling and instead mounts at 50/100/200/400 on both sides, which is how a
 * superlinear cost is told apart from a merely large one — the shape of the curve, not one number.
 * Warmed by default (four discarded mounts first): a cold mount profiles the JIT tiering up, which
 * attributes time to whatever ran first. `--cold` keeps the cold reading, which is what a real
 * first page load pays.
 *
 * Requires the client bundle: run `bun run bench:vs-shadcn:client` once, or build it with
 *   BENCH_CLIENT_ENTRY=test/perf/vs-shadcn/vs-client.svelte.ts BENCH_CLIENT_NAME=VsBench \
 *   BENCH_CLIENT_FILE=vs-client.js BENCH_CLIENT_OUT=.bench-out/vs-client \
 *   vite build -c scripts/bench-client.vite.config.ts
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const family = positional[0] ?? 'accordion';
const side = positional[1] ?? 'ixir';
const n = Number(positional[2] ?? 2000);
const warm = !args.includes('--cold');
const SCALE = args.includes('--scale');
const broadMode = args.includes('--broad');

const bundle = join(root, '.bench-out/vs-client/vs-client.js');
let content;
try {
	content = readFileSync(bundle, 'utf8');
} catch {
	console.error(`missing ${bundle} — run \`bun run bench:vs-shadcn:client\` once first.`);
	process.exit(1);
}

const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ content });

/** Mount once and tear down. Defined in-page so no CDP round trip lands inside the timed region. */
const BROAD = async ({ family, side, count, iterations }) => {
	const { flushSync } = globalThis.VsBench.svelte;
	// `hold` owns the tree and its props object; `broadTick` writes the one prop every unit reads.
	globalThis.VsBench.hold(family, side, count);
	const started = performance.now();
	for (let i = 0; i < iterations; i++) {
		globalThis.VsBench.broadTick(`t${i}`);
		flushSync();
	}
	const ms = performance.now() - started;
	globalThis.VsBench.release();
	return ms;
};

/** Mount once and tear down. Defined in-page so no CDP round trip lands inside the timed region. */
const MOUNT = async ({ family, side, count, drain }) => {
	const { mount, unmount, flushSync } = globalThis.VsBench.svelte;
	// Drain the previous tree before timing this one. Without it the later, larger points inherit
	// the garbage of every earlier mount and the fitted exponent picks up the collector rather than
	// the component — measured swings of 0.4 in k on unchanged code. Needs `--expose-gc`, which the
	// launch flags set; a no-op without it.
	if (drain && globalThis.gc) {
		for (let i = 0; i < 2; i++) {
			globalThis.gc();
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
	}
	const component = globalThis.VsBench.FAMILIES.find((f) => f.name === family)[side];
	const target = document.createElement('div');
	document.body.appendChild(target);
	const started = performance.now();
	const app = mount(component, { target, props: { n: count, tint: '', bump: '' } });
	flushSync();
	const ms = performance.now() - started;
	unmount(app);
	target.remove();
	return ms;
};

if (SCALE) {
	// The signal is the EXPONENT and the RATIO, not the wall time.
	//
	// `t ∝ n^k` fitted over the endpoints: k ≈ 1 is linear, k ≈ 2 is quadratic. That distinguishes a
	// cost from a defect, and unlike µs it barely moves with machine load.
	//
	// The two sides INTERLEAVE at each count, for the same reason `bench:vs-shadcn` interleaves: a
	// cold 400-item mount of this component allocates enough that a single reading swung 680–1300 ms
	// on unchanged code — ±40%, enough to move k by 0.4. Sequential sides put that drift entirely on
	// whichever ran second. Interleaved, both absorb it, and the RATIO column survives it even when
	// the absolute columns do not.
	const COUNTS = [50, 100, 200, 400];
	const sides = positional[1] ? [positional[1]] : ['ixir', 'shadcn'];
	const times = Object.fromEntries(sides.map((side) => [side, []]));
	// A `hand` family opposes a hand-written control, not shadcn — read its own label from the page
	// rather than hardcoding a column heading that would be wrong for it.
	const opponent = await page.evaluate(
		(name) => globalThis.VsBench.FAMILIES.find((f) => f.name === name)?.opponentLabel ?? 'shadcn',
		family
	);
	const label = (side) => (side === 'ixir' ? 'ixir' : opponent);

	for (const count of COUNTS) {
		for (let round = 0; round < 3; round++) {
			for (const side of sides) {
				const ms = await page.evaluate(MOUNT, { family, side, count, drain: round === 0 });
				const at = times[side];
				at[COUNTS.indexOf(count)] = Math.min(at[COUNTS.indexOf(count)] ?? Infinity, ms);
			}
		}
	}

	const exponent = (at) => Math.log(at.at(-1) / at[0]) / Math.log(COUNTS.at(-1) / COUNTS[0]);
	const pad = (x, w, d = 1) => x.toFixed(d).padStart(w);

	console.log(`\n${family} — cold mount, best of 3, sides interleaved per point\n`);
	console.log(
		`  n${sides.map((side) => `${label(side).padStart(12)} ms`).join('')}${sides.length > 1 ? '     ratio' : ''}`
	);
	for (const [i, count] of COUNTS.entries()) {
		const ratio = sides.length > 1 ? `  ${pad(times.ixir[i] / times.shadcn[i], 7, 1)}×` : '';
		console.log(
			`  ${String(count).padStart(3)}${sides.map((side) => pad(times[side][i], 15)).join('')}${ratio}`
		);
	}
	console.log('');
	for (const side of sides) {
		console.log(
			`  ${label(side).padEnd(7)} exponent k = ${exponent(times[side]).toFixed(2)}  (t ∝ n^k; 1.00 = linear)`
		);
	}
	console.log('');

	await browser.close();
	// Non-zero when OUR side is superlinear, so this doubles as a pass/fail loop for a bisect.
	process.exit(exponent(times.ixir ?? times[sides[0]]) > 1.2 ? 1 : 0);
}

const cdp = await page.context().newCDPSession(page);
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
// A broad update is one flush over `n` units, so a readable sample count needs iterations, not a
// bigger tree: 40 flushes over 400 units lands ~1500 samples where one flush yields three.
const BROAD_ARGS = { family, side, count: Math.min(n, 400), iterations: 40 };
if (warm) {
	for (let i = 0; i < 4; i++) {
		await page.evaluate(
			broadMode ? BROAD : MOUNT,
			broadMode ? BROAD_ARGS : { family, side, count: n }
		);
	}
}
await cdp.send('Profiler.start');
await page.evaluate(broadMode ? BROAD : MOUNT, broadMode ? BROAD_ARGS : { family, side, count: n });
const { profile } = await cdp.send('Profiler.stop');
await browser.close();

const byId = new Map(profile.nodes.map((node) => [node.id, node]));
const self = new Map();
for (const sample of profile.samples) {
	const frame = byId.get(sample)?.callFrame;
	if (!frame) continue;
	const name =
		`${frame.functionName || '(anonymous)'}  ` +
		`${(frame.url || '').split('/').pop()}:${frame.lineNumber + 1}`;
	self.set(name, (self.get(name) ?? 0) + 1);
}

const total = profile.samples.length;
console.log(
	`\n${family}/${side} ${broadMode ? `broad ×${BROAD_ARGS.iterations} over ${BROAD_ARGS.count}` : `n=${n}`} ${warm ? 'warmed' : 'cold'} — ` +
		`${total} samples over ${((profile.endTime - profile.startTime) / 1000).toFixed(0)} ms\n`
);
for (const [name, count] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
	console.log(`  ${((count / total) * 100).toFixed(1).padStart(5)}%  ${name}`);
}
console.log('');
