import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadavg } from 'node:os';
import { pairedComparison } from '../../../../src/lib/test/perf/samples.ts';
const browser = await chromium.launch();
const diagnostics = [],
	pages = {},
	sessions = {},
	artifacts = {};
const results = {};
try {
	for (const side of ['before', 'after']) {
		const root = process.cwd() + '/.bench-out/m7-' + side;
		const js = readFileSync(root + '/client.js', 'utf8'),
			css = readFileSync(root + '/ui.css', 'utf8');
		artifacts[side] = {
			js: createHash('sha256').update(js).digest('hex'),
			css: createHash('sha256').update(css).digest('hex')
		};
		const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
		pages[side] = page;
		page.on('pageerror', (e) => diagnostics.push(e.message));
		page.on('console', (m) => {
			if (['warning', 'error'].includes(m.type())) diagnostics.push(m.text());
		});
		await page.goto('about:blank');
		await page.addStyleTag({ content: css });
		await page.addScriptTag({ content: js });
		sessions[side] = await page.context().newCDPSession(page);
	}
	for (const scenario of process.argv.slice(2).length
		? process.argv.slice(2)
		: ['default', 'static', 'merged', 'reactive']) {
		const samples = { before: [], after: [] };
		const heap = { before: [], after: [] };
		for (let round = 0; round < 20; round++) {
			const hashes = {};
			for (const side of round % 2 ? ['after', 'before'] : ['before', 'after']) {
				await sessions[side].send('HeapProfiler.collectGarbage');
				const r = await pages[side].evaluate(
					async (scenario) => globalThis.Integrated.sample(500, scenario),
					scenario
				);
				hashes[side] = createHash('sha256').update(r.html).digest('hex');
				if (round >= 4) samples[side].push({ mount: r.mount, update: r.update });
				if (await pages[side].evaluate(() => document.body.childElementCount))
					throw Error('teardown leaked DOM');
			}
			if (hashes.before !== hashes.after) throw Error('rendered output mismatch: ' + scenario);
		}
		for (let round = 0; round < 4; round++) {
			for (const side of round % 2 ? ['after', 'before'] : ['before', 'after']) {
				const values = [];
				for (const n of [100, 800]) {
					await pages[side].evaluate(({ n, scenario }) => globalThis.Integrated.hold(n, scenario), {
						n,
						scenario
					});
					let raw = '';
					const collect = (e) => {
						raw += e.chunk;
					};
					const cdp = sessions[side];
					cdp.on('HeapProfiler.addHeapSnapshotChunk', collect);
					await cdp.send('HeapProfiler.collectGarbage');
					await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
					cdp.off('HeapProfiler.addHeapSnapshotChunk', collect);
					const snap = JSON.parse(raw),
						fields = snap.snapshot.meta.node_fields;
					const index = fields.indexOf('self_size');
					if (index < 0) throw Error('missing heap sizes');
					let bytes = 0;
					for (let i = index; i < snap.nodes.length; i += fields.length) bytes += snap.nodes[i];
					values.push(bytes);
					await pages[side].evaluate(() => globalThis.Integrated.release());
					if (await pages[side].evaluate(() => document.body.childElementCount))
						throw Error('heap teardown leaked DOM');
				}
				heap[side].push({
					low: values[0],
					high: values[1],
					bytesPerButton: (values[1] - values[0]) / 700
				});
			}
		}
		results[scenario] = {
			heap,
			samples,
			mount: pairedComparison(
				samples.after.map((x) => x.mount),
				samples.before.map((x) => x.mount)
			),
			update: pairedComparison(
				samples.after.map((x) => x.update),
				samples.before.map((x) => x.update)
			)
		};
	}
	if (diagnostics.length) throw Error(diagnostics.join('\n'));
	console.log(
		JSON.stringify(
			{
				n: 500,
				rounds: 20,
				warmups: 4,
				load: loadavg(),
				browser: browser.version(),
				artifacts,
				note: 'Synchronous styled mount/update; layout/paint excluded. Exact HTML equality and callback/teardown assertions outside timing.',
				results
			},
			null,
			2
		)
	);
} finally {
	await browser.close();
}
