/** Build through bench:workloads; --browser=firefox/webkit runs the same behavior assertions. */
import { createHash } from 'node:crypto';
import * as playwright from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { render } from 'svelte/server';
import { loadavg, cpus } from 'node:os';

const args = process.argv.slice(2);
const browserName = args.find((arg) => arg.startsWith('--browser='))?.split('=')[1] ?? 'chromium';
if (!['chromium', 'firefox', 'webkit'].includes(browserName))
	throw new Error(`unsupported browser: ${browserName}`);
const reducedMotion = args.includes('--reduced-motion') ? 'reduce' : 'no-preference';
const only = args.filter((arg) => !arg.startsWith('--'));
for (const arg of args.filter((arg) => arg.startsWith('--'))) {
	if (!arg.startsWith('--browser=') && arg !== '--reduced-motion')
		throw new Error(`unknown option: ${arg}`);
}
const root = join(import.meta.dirname, '..', '.bench-out/workloads');
const bundle = readFileSync(join(root, 'workloads.js'), 'utf8');
const css = readFileSync(join(root, 'ui.css'), 'utf8');
const { FAMILIES } = await import(pathToFileURL(join(root, '../vs-ssr/ssr-entry.js')).href);
const button = FAMILIES.find((family) => family.name === 'button');
if (!button) throw new Error('missing button SSR fixture');
const ssr = Object.fromEntries(
	['ixir', 'shadcn'].map((side) => [side, render(button[side], { props: { n: 2 } }).body])
);
const browser = await playwright[browserName].launch();
const diagnostics = [];
const results = [];
try {
	const page = await browser.newPage({
		viewport: { width: 1280, height: 720 },
		reducedMotion
	});
	page.on('pageerror', (error) => diagnostics.push(error.message));
	page.on('console', (message) => {
		if (['warning', 'error'].includes(message.type())) diagnostics.push(message.text());
	});
	await page.goto('about:blank');
	await page.addStyleTag({ content: css });
	await page.addScriptTag({ content: bundle });
	// eslint-disable-next-line no-undef
	const parity = await page.evaluate((html) => globalThis.Workloads.verifyButtons(html), ssr);
	// eslint-disable-next-line no-undef
	const scenarios = await page.evaluate(() => globalThis.Workloads.SCENARIOS);
	// eslint-disable-next-line no-undef
	const positioning = await page.evaluate(() => globalThis.Workloads.verifyPositioning());
	// eslint-disable-next-line no-undef
	const expandedTree = await page.evaluate(() => globalThis.Workloads.verifyExpandedTree());
	for (const name of only)
		if (!scenarios.includes(name)) throw new Error(`unknown workload: ${name}`);
	for (const scenario of only.length ? only : scenarios) {
		results.push(
			await page.evaluate(
				// eslint-disable-next-line no-undef
				({ scenario, n, rounds }) => globalThis.Workloads.run(scenario, n, rounds),
				{
					scenario,
					n: Number(process.env.BENCH_N ?? 100),
					rounds: Number(process.env.BENCH_ROUNDS ?? 7)
				}
			)
		);
	}
	if (diagnostics.length)
		throw new Error(`unexpected browser diagnostics:\n${diagnostics.join('\n')}`);
	console.log(
		JSON.stringify(
			{
				browser: browserName,
				reducedMotion,
				version: browser.version(),
				artifacts: {
					js: createHash('sha256').update(bundle).digest('hex'),
					css: createHash('sha256').update(css).digest('hex')
				},
				parity,
				positioning,
				expandedTree,
				load: loadavg()[0],
				cores: cpus().length,
				results
			},
			null,
			2
		)
	);
} finally {
	await browser.close();
}
