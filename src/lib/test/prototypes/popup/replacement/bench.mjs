import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpus, loadavg } from 'node:os';
import { chromium } from 'playwright';
import { evaluateGrowth } from '../../../../../../scripts/growth-gate.mjs';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
process.env.TZ = 'UTC';
const ssr = await import(
	pathToFileURL(resolve(root, '.bench-out/popup-replacement-ssr/ssr.js')).href
);
const samples = ssr.samples();
for (const sample of samples) assert.deepEqual(sample.candidate, sample.reference, sample.name);
const server = ssr.timings();
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc --stack-size=8000'] });
const diagnostics = [];
let client, growth, handles;
try {
	const page = await browser.newPage({ timezoneId: 'UTC', locale: 'en-US' });
	page.on('pageerror', (error) => diagnostics.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'warning' || message.type() === 'error')
			diagnostics.push(message.text());
	});
	await page.goto('about:blank');
	await page.addScriptTag({
		content: readFileSync(resolve(root, '.bench-out/popup-replacement-client/client.js'), 'utf8')
	});
	client = await page.evaluate((html) => globalThis.PopupReplacement.run(html), samples);
	growth = await page.evaluate(() => globalThis.PopupReplacement.growth());
	handles = await page.evaluate(() => globalThis.PopupReplacement.handles());
} finally {
	await browser.close();
}
assert.deepEqual(diagnostics, [], 'Unexpected browser diagnostics');
for (const { canonical } of Object.values(handles)) assert.equal(canonical.checksum, 32700);
for (const sample of samples) {
	const rows = client.filter((row) => row.name === sample.name);
	assert.equal(rows.length, 2);
	assert.equal(rows[0].elements, rows[1].elements, `${sample.name} mount/hydrate DOM census`);
}
const baseline = JSON.parse(
	readFileSync(resolve(root, 'src/lib/test/perf/growth/growth-baseline.json'), 'utf8')
);
const gates = Object.fromEntries(
	Object.entries(growth).map(([mode, rows]) => [
		mode,
		evaluateGrowth(rows, baseline, ['dropdown-menu', 'select'])
	])
);
const report = {
	recorded: new Date().toISOString(),
	node: process.version,
	cpu: cpus()[0]?.model,
	load: loadavg(),
	scope:
		'Canonical roots and handles only, unstyled; SSR checked against frozen pre-removal HTML. No legacy runtime or cross-implementation timing comparison. Not a published bundle-size or retained-heap benchmark.',
	ssr: samples.map((sample) => ({
		name: sample.name,
		bytes: Buffer.byteLength(sample.reference.body),
		comments: (sample.reference.body.match(/<!--/g) ?? []).length,
		exactParity: true
	})),
	server,
	client,
	handles,
	growth,
	gates,
	diagnostics
};
const output = resolve(root, '.bench-out/popup-replacement-report.json');
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
for (const gate of Object.values(gates))
	assert.deepEqual(gate.failures, [], 'Existing growth gate');
console.error(`Report: ${output}`);
