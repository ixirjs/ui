/**
 * Svelte primitives (effects, deriveds, contexts, attachments) and Kernel calls CREATED PER UNIT,
 * counted by instrumenting the built client bundle in memory — no timing, no machine dependence.
 * Reported on the slope between successive counts, so a per-unit number that grows with n is a
 * cascade (accordion's eager block re-run showed as 306 → 606 → 1206 renders per item).
 *
 *   node scripts/bench-vs-primitives.mjs <family> [side=ixir] [--counts=100,200,400,800]
 *
 * Requires the client bundle (run bench:vs-shadcn:client once).
 */
/* eslint-disable no-undef */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const args = process.argv.slice(2);
const [family, side = 'ixir'] = args.filter((a) => !a.startsWith('--'));
const COUNTS = (args.find((a) => a.startsWith('--counts='))?.slice(9) ?? '100,200,400,800')
	.split(',')
	.map(Number);

const PATCHES = [
	['effect', /function create_effect\(type, fn\) \{/],
	['derived', /function derived\(fn\) \{/],
	['execute_derived', /function execute_derived\(derived\) \{/],
	['update_effect', /function update_effect\(effect\) \{/],
	['mark_reactions', /function mark_reactions\(signal, status, updated_during_traversal\) \{/],
	['getContext', /function getContext\(key\) \{/],
	['attach', /function attach\(node, get_fn\) \{/],
	['block', /function block\(fn, flags = 0\) \{/],
	['branch', /function branch\(fn\) \{/],
	['set_attributes', /function set_attributes\(\s*[^)]*\) \{/],
	['Kernel.render', /\tfunction render\((view|el)\) \{/],
	['resolvePresentation', /function resolvePresentation\(values, registry\) \{/]
];
let bundle = readFileSync(join(ROOT, '.bench-out/vs-client/vs-client.js'), 'utf8');
for (const [name, re] of PATCHES) {
	if (!re.test(bundle)) {
		console.error(
			`no match for ${name} — the Svelte runtime or Kernel changed shape; update PATCHES`
		);
		process.exit(1);
	}
	bundle = bundle.replace(
		re,
		(m) =>
			`${m}(globalThis.__c||(globalThis.__c={}))["${name}"]=((globalThis.__c["${name}"]||0)+1);`
	);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ content: bundle });
const count = (n) =>
	page.evaluate(
		({ family, side, n }) => {
			const { mount, unmount, flushSync } = globalThis.VsBench.svelte;
			const c = globalThis.VsBench.FAMILIES.find((f) => f.name === family)[side];
			const t = document.createElement('div');
			document.body.appendChild(t);
			globalThis.__c = {};
			const app = mount(c, { target: t, props: { n, tint: '', bump: '' }, intro: false });
			flushSync();
			const out = { ...globalThis.__c };
			unmount(app);
			t.remove();
			return out;
		},
		{ family, side, n }
	);
const at = {};
for (const n of COUNTS) at[n] = await count(n);
await browser.close();

const keys = [...new Set(COUNTS.flatMap((n) => Object.keys(at[n])))].sort();
console.log(`\n${family}/${side} — created per unit on the slope between successive n (intro off)`);
console.log(
	'  ' +
		'primitive'.padEnd(22) +
		COUNTS.slice(1)
			.map((n, i) => `${COUNTS[i]}→${n}`.padStart(11))
			.join('')
);
for (const k of keys) {
	const row = COUNTS.slice(1).map(
		(n, i) => ((at[n][k] ?? 0) - (at[COUNTS[i]][k] ?? 0)) / (n - COUNTS[i])
	);
	console.log('  ' + k.padEnd(22) + row.map((v) => v.toFixed(1).padStart(11)).join(''));
}
