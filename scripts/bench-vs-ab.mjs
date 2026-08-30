/**
 * Interleaved mount-slope A/B between TWO client bundles — the only accepted evidence for a µs claim.
 *
 *   node scripts/bench-vs-ab.mjs <family> <bundleA.js> <bundleB.js> [rounds=7]
 *
 * Each round mounts the low and high counts on both bundles, alternating which goes first; the
 * slope is taken over per-endpoint floors. Build the "before" bundle into its own directory with
 * BENCH_CLIENT_OUT before changing code (see bench:vs-shadcn:client in package.json).
 */
/* eslint-disable no-undef */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [family, A, B, R = '7'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
const pages = {};
for (const [k, f] of [
	['A', A],
	['B', B]
]) {
	const p = await browser.newPage();
	await p.goto('about:blank');
	await p.addScriptTag({ content: readFileSync(f, 'utf8') });
	pages[k] = p;
}
const MOUNT = async ({ family, count }) => {
	const { mount, unmount, flushSync } = globalThis.VsBench.svelte;
	if (globalThis.gc) {
		for (let i = 0; i < 2; i++) {
			globalThis.gc();
			await new Promise((r) => setTimeout(r, 0));
		}
	}
	const c = globalThis.VsBench.FAMILIES.find((f) => f.name === family).ixir;
	const t = document.createElement('div');
	document.body.appendChild(t);
	const s = performance.now();
	const app = mount(c, { target: t, props: { n: count, tint: '', bump: '' } });
	flushSync();
	const ms = performance.now() - s;
	unmount(app);
	t.remove();
	return ms;
};
const [lo, hi] = family === 'accordion' || family === 'tree' ? [50, 200] : [100, 800];
const best = { A: [Infinity, Infinity], B: [Infinity, Infinity] };
for (let r = 0; r < Number(R); r++)
	for (const k of r % 2 ? ['B', 'A'] : ['A', 'B']) {
		best[k][0] = Math.min(best[k][0], await pages[k].evaluate(MOUNT, { family, count: lo }));
		best[k][1] = Math.min(best[k][1], await pages[k].evaluate(MOUNT, { family, count: hi }));
	}
const slope = (k) => ((best[k][1] - best[k][0]) * 1000) / (hi - lo);
console.log(
	`${family}: A ${slope('A').toFixed(1)} µs/unit  B ${slope('B').toFixed(1)} µs/unit  B/A ${((slope('B') / slope('A') - 1) * 100).toFixed(1)}%`
);
await browser.close();
