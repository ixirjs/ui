/**
 * Driver for the CSR half of the nesting benchmark. Run with `bun run bench:nesting:client`.
 *
 * The measurement lives in `src/lib/test/perf/nesting/nesting-client.svelte.ts` and runs inside the
 * page; this file only builds the inputs, launches the browser and formats the report. Keeping the
 * timing in-page matters: driving each mount over CDP would put a round trip inside every timed
 * region and measure the protocol instead of the framework.
 *
 * The hydrate leg needs real server markup, so the SSR bundle is imported here in node and its
 * output handed to the page — hydrating client-rendered or hand-written HTML would skip the very
 * anchors hydration walks.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cpus } from 'node:os';
import { pathToFileURL } from 'node:url';

const root = join(import.meta.dirname, '..');
const ARMS = ['component', 'component-spread', 'snippet', 'snippet-packet'];
const LOW = 100;
const HIGH = 800;
const SHALLOW = 2;
const DEEP = 8;
const GRID = [
	{ n: LOW, depth: SHALLOW },
	{ n: HIGH, depth: SHALLOW },
	{ n: LOW, depth: DEEP },
	{ n: HIGH, depth: DEEP }
];

// Nine measured rounds, four update iterations. The client legs are far more expensive than the
// server's — one mount at the deep corner instantiates 6400 levels, and the broad-update leg
// re-renders all of them — so the SSR half's 40-round budget would put a single pass past an hour.
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 12);
const WARMUP = Number(process.env.BENCH_WARMUP ?? 3);
const UPDATES = Number(process.env.BENCH_UPDATES ?? 4);

// ─── SSR markup for the hydrate leg ────────────────────────────────────────────────────────────

const { render } = await import('svelte/server');
const { Nesting } = await import(
	pathToFileURL(join(root, '.bench-out/nesting-ssr/ssr-entry.js')).href
);

const ssr = {};
for (const arm of ARMS) {
	for (const { n, depth } of GRID) {
		ssr[`${arm}:${n}:${depth}`] = render(Nesting, {
			props: { n, arm, depth, tint: 't0', deep: 0 }
		}).body;
	}
}

// ─── Browser ───────────────────────────────────────────────────────────────────────────────────

const browser = await chromium.launch({
	args: [
		// `globalThis.gc()` for the heap leg, and precise sizes — without this second flag
		// `usedJSHeapSize` is bucketed to ~5 MB and every arm reports the same number.
		'--js-flags=--expose-gc',
		'--enable-precise-memory-info'
	]
});
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({
	content: readFileSync(join(root, '.bench-out/client/nesting-client.js'), 'utf8')
});

const results = await page.evaluate(
	// eslint-disable-next-line no-undef
	(options) => globalThis.NestingBench.run(options),
	{ rounds: ROUNDS, warmup: WARMUP, updateIterations: UPDATES, ssr }
);

// Raw per-point numbers, because every figure below is a slope and a slope hides a flat input.
// The heap leg silently reported 0 for every arm until these were printed.
if (process.env.BENCH_DEBUG) console.log(JSON.stringify(results, null, 1));

await browser.close();

// ─── Report ────────────────────────────────────────────────────────────────────────────────────

const at = (arm, metric, n, depth) => results[arm][metric][`${n}:${depth}`];

/** Cost of one nesting level, per unit — the depth slope at the high unit count, in µs. */
const perLevel = (arm, metric) =>
	((at(arm, metric, HIGH, DEEP) - at(arm, metric, HIGH, SHALLOW)) * 1000) /
	((DEEP - SHALLOW) * HIGH);
/** Cost of one whole unit at full depth — the unit slope, in µs. */
const perUnit = (arm, metric) =>
	((at(arm, metric, HIGH, DEEP) - at(arm, metric, LOW, DEEP)) * 1000) / (HIGH - LOW);

/** Node census and heap are counts, not milliseconds — same slopes without the ×1000. */
const countPerUnit = (arm, pick) =>
	(pick(results[arm].census[`${HIGH}:${DEEP}`]) - pick(results[arm].census[`${LOW}:${DEEP}`])) /
	(HIGH - LOW);
const countPerLevel = (arm, pick) =>
	(pick(results[arm].census[`${HIGH}:${DEEP}`]) - pick(results[arm].census[`${HIGH}:${SHALLOW}`])) /
	((DEEP - SHALLOW) * HIGH);
const heapPerUnit = (arm) =>
	(results[arm].heap[`${HIGH}:${DEEP}`] - results[arm].heap[`${LOW}:${DEEP}`]) / (HIGH - LOW);
const heapPerLevel = (arm) =>
	(results[arm].heap[`${HIGH}:${DEEP}`] - results[arm].heap[`${HIGH}:${SHALLOW}`]) /
	((DEEP - SHALLOW) * HIGH);

const BASE = 'component';
const pct = (x, base) =>
	base === 0 ? '    —' : `${x > base ? '+' : ''}${(((x - base) / base) * 100).toFixed(0)}%`;
const f = (x, w = 8, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : '—').padStart(w);

console.log(`\nCSR — ${HIGH} units × ${DEEP} levels, slopes over both axes (lower is better)\n`);

console.log('  mount and hydrate, µs per nesting level per unit\n');
console.log(
	'  arm               mount/level  vs base   mount/unit  hydrate/level  vs base  hydrate/unit'
);
for (const arm of ARMS) {
	console.log(
		`  ${arm.padEnd(16)} ${f(perLevel(arm, 'mount'))}  ${pct(perLevel(arm, 'mount'), perLevel(BASE, 'mount')).padStart(7)}  ` +
			`${f(perUnit(arm, 'mount'), 11)}  ${f(perLevel(arm, 'hydrate'), 13)}  ` +
			`${pct(perLevel(arm, 'hydrate'), perLevel(BASE, 'hydrate')).padStart(7)}  ${f(perUnit(arm, 'hydrate'), 12)}`
	);
}

console.log(
	'\n  updates, µs per unit — targeted touches one leaf per unit, broad touches every level\n'
);
console.log('  arm              targeted/unit  vs base   broad/unit  vs base   broad/level');
for (const arm of ARMS) {
	console.log(
		`  ${arm.padEnd(16)} ${f(perUnit(arm, 'targeted'), 13)}  ${pct(perUnit(arm, 'targeted'), perUnit(BASE, 'targeted')).padStart(7)}  ` +
			`${f(perUnit(arm, 'broad'), 11)}  ${pct(perUnit(arm, 'broad'), perUnit(BASE, 'broad')).padStart(7)}  ` +
			`${f(perLevel(arm, 'broad'), 12)}`
	);
}

console.log('\n  live DOM and heap\n');
console.log(
	'  arm              elements/unit  comments/unit  texts/unit  comments/level   heap B/unit  vs base   heap B/level'
);
for (const arm of ARMS) {
	console.log(
		`  ${arm.padEnd(16)} ${f(
			countPerUnit(arm, (c) => c.elements),
			13,
			1
		)}  ` +
			`${f(
				countPerUnit(arm, (c) => c.comments),
				13,
				1
			)}  ` +
			`${f(
				countPerUnit(arm, (c) => c.texts),
				10,
				1
			)}  ` +
			`${f(
				countPerLevel(arm, (c) => c.comments),
				14,
				1
			)}  ` +
			`${f(heapPerUnit(arm), 12, 0)}  ${pct(heapPerUnit(arm), heapPerUnit(BASE)).padStart(7)}  ` +
			`${f(heapPerLevel(arm), 12, 0)}`
	);
}

console.log(
	`\n  ${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}, chromium via playwright, ` +
		`${ROUNDS - WARMUP} measured rounds, ${UPDATES} update iterations.\n` +
		'  Same caveat as the SSR half: run 3× and compare medians. A difference under ~10% is\n' +
		'  below this harness’s resolution. `heap B/unit` needs --enable-precise-memory-info\n' +
		'  (set here) and still reads noisier than every other axis — treat it as an order of\n' +
		'  magnitude, not a figure.\n'
);
