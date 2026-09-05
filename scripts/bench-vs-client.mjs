/**
 * Driver for the CSR half of the head-to-head. Run with `bun run bench:vs-shadcn:client`.
 *
 * The measurement lives in `src/lib/test/perf/vs-shadcn/vs-client.svelte.ts` and runs inside the
 * page; this file only builds the inputs, launches the browser and formats the report. Keeping the
 * timing in-page matters: driving each mount over CDP would put a round trip inside every timed
 * region and measure the protocol instead of the framework.
 *
 * The hydrate leg needs real server markup, so the SSR bundle is imported here in node and its
 * output handed to the page.
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cpus, loadavg } from 'node:os';
import { pathToFileURL } from 'node:url';

const root = join(import.meta.dirname, '..');
const loadAtStart = loadavg()[0];
const fingerprint = (path) =>
	createHash('sha256')
		.update(readFileSync(join(root, path)))
		.digest('hex');
const artifacts = {
	client: fingerprint('.bench-out/vs-client/vs-client.js'),
	ssr: fingerprint('.bench-out/vs-ssr/ssr-entry.js')
};
const SIDES = ['ixir', 'shadcn'];
const LOW = 100;
const HIGH = 800;

const args = process.argv.slice(2);
for (const arg of args)
	if (arg.startsWith('--') && !['--json'].includes(arg))
		throw new Error(`unknown benchmark option: ${arg}`);
const JSON_OUT = args.includes('--json');
const only = args.filter((a) => !a.startsWith('--'));

const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 19);
const WARMUP = Number(process.env.BENCH_WARMUP ?? 3);
const STORM = Number(process.env.BENCH_STORM ?? 100);
const BROAD = Number(process.env.BENCH_BROAD ?? 4);

// ─── SSR markup for the hydrate leg ────────────────────────────────────────────────────────────

const { render } = await import('svelte/server');
const { FAMILIES, pairedComparison, workload } = await import(
	pathToFileURL(join(root, '.bench-out/vs-ssr/ssr-entry.js')).href
);
for (const name of only)
	if (!FAMILIES.some((family) => family.name === name)) throw new Error(`unknown family: ${name}`);
const families = only.length ? FAMILIES.filter((f) => only.includes(f.name)) : FAMILIES;

const ssr = {};
for (const family of families) {
	for (const side of SIDES) {
		for (const n of family.clientCounts ?? [LOW, HIGH]) {
			ssr[`${family.name}:${side}:${n}`] = render(family[side], { props: { n } }).body;
		}
	}
}

// ─── Browser ───────────────────────────────────────────────────────────────────────────────────

const browser = await chromium.launch({
	// `globalThis.gc()` drains between rounds so a timed region never contains someone else's
	// garbage. The heap leg below does NOT rely on it — it takes a real snapshot over CDP.
	args: ['--js-flags=--expose-gc']
});
const diagnostics = [];
let results;
try {
	const page = await browser.newPage();
	page.on('pageerror', (error) => diagnostics.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'warning' || message.type() === 'error')
			diagnostics.push(message.text());
	});
	await page.goto('about:blank');
	await page.addScriptTag({
		content: readFileSync(join(root, '.bench-out/vs-client/vs-client.js'), 'utf8')
	});

	results = await page.evaluate(
		// eslint-disable-next-line no-undef
		(options) => globalThis.VsBench.run(options),
		{
			rounds: ROUNDS,
			warmup: WARMUP,
			storm: STORM,
			broadIterations: BROAD,
			ssr,
			families: families.map((f) => f.name)
		}
	);

	if (diagnostics.length) {
		throw new Error(`unexpected browser diagnostics:\n${diagnostics.join('\n')}`);
	}

	// ─── Retained heap, by heap snapshot ───────────────────────────────────────────────────────────
	//
	// Bytes of REACHABLE OBJECT the mounted tree holds, taken while the tree is live and diffed
	// between the two counts so page-fixed cost cancels. This used to read
	// `performance.memory.usedJSHeapSize` from inside the page, which is page-wide: it carries V8's
	// fragmentation and every other allocation made so far, and it reported a card at 112 kB/unit
	// (+730% against shadcn) where the reachable objects are 25 kB (+85%). A snapshot forces a full
	// GC and counts what is actually retained, which is the question the column asks.
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('HeapProfiler.enable');

	/** Total self_size over every node in one snapshot. */
	async function snapshotBytes() {
		let raw = '';
		const collect = (event) => (raw += event.chunk);
		cdp.on('HeapProfiler.addHeapSnapshotChunk', collect);
		await cdp.send('HeapProfiler.collectGarbage');
		await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
		cdp.off('HeapProfiler.addHeapSnapshotChunk', collect);

		const snapshot = JSON.parse(raw);
		const fields = snapshot.snapshot.meta.node_fields;
		const stride = fields.length;
		const sizeAt = fields.indexOf('self_size');
		let total = 0;
		for (let i = 0; i < snapshot.nodes.length; i += stride) total += snapshot.nodes[i + sizeAt];
		return total;
	}

	for (const family of families) {
		for (const side of SIDES) {
			for (const n of family.clientCounts ?? [LOW, HIGH]) {
				// eslint-disable-next-line no-undef
				await page.evaluate((held) => globalThis.VsBench.hold(...held), [family.name, side, n]);
				results[family.name][side].heap ??= {};
				results[family.name][side].heap[n] = await snapshotBytes();
				// eslint-disable-next-line no-undef
				await page.evaluate(() => globalThis.VsBench.release());
			}
		}
	}

	if (process.env.BENCH_DEBUG) console.log(JSON.stringify(results, null, 1));
} finally {
	await browser.close();
}
if (diagnostics.length)
	throw new Error(`unexpected browser diagnostics:\n${diagnostics.join('\n')}`);

// ─── Report ────────────────────────────────────────────────────────────────────────────────────

const provenance = JSON.parse(readFileSync(join(root, 'bench/vs-shadcn/provenance.json'), 'utf8'));
const machine = `${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}`;
// See the note in vs-bench.ts: a loaded box inflates every absolute here and distorts the ratios.
const load = Math.max(loadAtStart, loadavg()[0]);

const comparisons = Object.fromEntries(
	families.map((family) => {
		const [lo, hi] = family.clientCounts ?? [LOW, HIGH];
		const metrics = Object.fromEntries(
			['mount', 'hydrate', 'targeted', 'broad'].map((metric) => {
				const series = (side) => {
					const samples = results[family.name][side].samples[metric];
					if (samples[hi]?.length !== ROUNDS - WARMUP || samples[lo]?.length !== ROUNDS - WARMUP)
						throw new Error(`missing samples: ${family.name}/${side}/${metric}`);
					return metric === 'targeted'
						? samples[hi]
						: samples[hi].map((value, i) => (value - samples[lo][i]) / (hi - lo));
				};
				return [metric, pairedComparison(series('ixir'), series('shadcn'))];
			})
		);
		return [
			family.name,
			{
				workload: workload(family.name),
				qualification:
					load > cpus().length / 4 ? 'busy-machine' : 'diagnostic-only; inspect workload parity',
				metrics
			}
		];
	})
);

if (JSON_OUT) {
	console.log(
		JSON.stringify(
			{ machine, load, provenance, artifacts, storm: STORM, broad: BROAD, comparisons, results },
			null,
			'\t'
		)
	);
	process.exit(0);
}

/** Per-unit slope: fixed page setup cancels, what remains is the marginal cost of one unit. */
const countsOf = (family) => family.clientCounts ?? [LOW, HIGH];
const perUnit = (family, side, metric) => {
	const [lo, hi] = countsOf(family);
	return (
		((results[family.name][side][metric][hi] - results[family.name][side][metric][lo]) * 1000) /
		(hi - lo)
	);
};
const countPerUnit = (family, side, pick) => {
	const [lo, hi] = countsOf(family);
	return (
		(pick(results[family.name][side].census[hi]) - pick(results[family.name][side].census[lo])) /
		(hi - lo)
	);
};
const heapPerUnit = (family, side) => {
	const [lo, hi] = countsOf(family);
	return (results[family.name][side].heap[hi] - results[family.name][side].heap[lo]) / (hi - lo);
};
/** The targeted leg is a CONSTANT, not a slope: one probe unit, whatever `n` is around it. */
const targetedAt = (family, side, n) => results[family.name][side].targeted[n] * 1000;

const f = (x, w = 8, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : '—').padStart(w);
/** `hand` families oppose a hand-written control, not shadcn — say so in the column. */
const label = (family, side) => (side === 'ixir' ? 'ixir' : (family.opponentLabel ?? 'shadcn'));
/**
 * A percentage against another library is a verdict; a percentage against hand-written markup is
 * not — see the same note in `vs-bench.ts`. A `hand` family reports a multiple of the floor.
 */
const pct = (ours, theirs, family) =>
	!Number.isFinite(ours) || !Number.isFinite(theirs) || theirs === 0
		? '     —'
		: family?.opponent === 'hand'
			? `${(ours / theirs).toFixed(0)}×`.padStart(6)
			: `${ours > theirs ? '+' : ''}${(((ours - theirs) / theirs) * 100).toFixed(0)}%`.padStart(6);

console.log(
	'\nDiagnostic runtime comparison only: no styled paint/motion completion or behavioral-equivalence claim.'
);
console.log(
	`\n@ixirjs/ui vs shadcn-svelte — client cost (lower is better)\n\n` +
		`  shadcn-svelte registry ${provenance.registryHash}, bits-ui ${provenance.bitsUi}, svelte ${provenance.svelte}\n` +
		`  ${machine}, chromium via playwright, ${ROUNDS - WARMUP} measured rounds, targeted storm of ${STORM}, ${BROAD} broad updates\n` +
		`  1-minute load average ${load.toFixed(2)} of ${cpus().length} cores\n` +
		(load > cpus().length / 4
			? '\n  ! THIS BOX IS BUSY. Absolute µs below are inflated and the ratios are unreliable.\n' +
				'    Quiet the machine and re-run before quoting anything from this table.\n'
			: '')
);

console.log('  µs per unit — mount and hydrate are slopes over unit count\n');
console.log('  family      side     mount   vs      hydrate   vs        broad   vs');
for (const family of families) {
	for (const side of SIDES) {
		const other = side === 'ixir' ? 'shadcn' : 'ixir';
		console.log(
			`  ${(side === 'ixir' ? family.name : '').padEnd(11)} ${label(family, side).padEnd(7)} ` +
				`${f(perUnit(family, side, 'mount'))}  ${side === 'ixir' ? pct(perUnit(family, side, 'mount'), perUnit(family, other, 'mount'), family) : '      '}  ` +
				`${f(perUnit(family, side, 'hydrate'), 9)}  ${side === 'ixir' ? pct(perUnit(family, side, 'hydrate'), perUnit(family, other, 'hydrate'), family) : '      '}  ` +
				`${f(perUnit(family, side, 'broad'), 9)}  ${side === 'ixir' ? pct(perUnit(family, side, 'broad'), perUnit(family, other, 'broad'), family) : ''}`
		);
	}
}

console.log(
	`\n  targeted update — ONE probe unit changes, µs per flush. Should not grow with the tree\n  around it; that it does for a side is the finding, not the absolute number.\n`
);
console.log('  family      side       low       high   growth   vs   (counts printed per family)');
for (const family of families) {
	for (const side of SIDES) {
		const other = side === 'ixir' ? 'shadcn' : 'ixir';
		const [loN, hiN] = countsOf(family);
		const lo = targetedAt(family, side, loN);
		const hi = targetedAt(family, side, hiN);
		console.log(
			`  ${(side === 'ixir' ? `${family.name} ${loN}/${hiN}` : '').padEnd(11)} ${label(family, side).padEnd(7)} ` +
				`${f(lo, 8)}  ${f(hi, 9)}  ${f(hi / lo, 6, 1)}×  ` +
				`${side === 'ixir' ? pct(hi, targetedAt(family, other, hiN), family) : ''}`
		);
	}
}

console.log('\n  live DOM and retained heap, per unit\n');
console.log('  family      side    elements  comments  texts    heap B    vs');
for (const family of families) {
	for (const side of SIDES) {
		const other = side === 'ixir' ? 'shadcn' : 'ixir';
		console.log(
			`  ${(side === 'ixir' ? family.name : '').padEnd(11)} ${label(family, side).padEnd(7)} ` +
				`${f(
					countPerUnit(family, side, (c) => c.elements),
					8,
					1
				)}  ` +
				`${f(
					countPerUnit(family, side, (c) => c.comments),
					8,
					1
				)}  ` +
				`${f(
					countPerUnit(family, side, (c) => c.texts),
					5,
					1
				)}  ` +
				`${f(heapPerUnit(family, side), 8, 0)}  ` +
				`${side === 'ixir' ? pct(heapPerUnit(family, side), heapPerUnit(family, other), family) : ''}`
		);
	}
}

console.log(
	'\n  Endpoint medians; raw samples are included in --json. Balanced order; GC between arms.\n' +
		'  Ratios are diagnostic, not statistically established competitive wins.\n' +
		'  `heap B/unit` is reachable bytes from a real heap snapshot (full GC first), diffed\n' +
		'  between the two counts — retained object cost, not page-wide `usedJSHeapSize`.\n'
);

console.log('Paired 95% bootstrap intervals (within-run diagnostics only):');
console.log(JSON.stringify(comparisons, null, 2));
