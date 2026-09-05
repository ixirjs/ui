/**
 * Growth-shape gate. Run with `bun run bench:growth`.
 *
 * Mounts each collection-owning family at four sizes in a real browser and fits `t ∝ n^k`.
 * `k ≈ 1` is linear; anything approaching 2 is a per-child read of an owner-wide value, which is the
 * defect class documented in `docs/research/perf-vs-shadcn-2026-08.md` §7.
 *
 * Growth ratios reduce sensitivity to machine speed but do not eliminate load, GC or fixed-cost
 * effects. Historical endpoint baselines remain enforced; the all-point fit also has a ceiling.
 * Missing evidence and unexpected diagnostics fail in both human and JSON output modes.
 *
 * Why a browser: children register with their parent from an atom's `onmount`, which never fires on
 * the server. A server render therefore sees an empty collection and the per-child O(n) read costs
 * O(1) — the pre-fix tree measured k = 0.60 on the server and k = 2.51 in a browser. SSR cannot see
 * this class at all.
 *
 *   bun run bench:growth              gate against src/lib/test/perf/growth/growth-baseline.json
 *   bun run bench:growth -- tree      one or more families
 *   bun run bench:growth -- --update  accept the current exponents as the baseline
 *   bun run bench:growth -- --json    machine-readable
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cpus, loadavg } from 'node:os';
import { evaluateGrowth, growth } from './growth-gate.mjs';

const root = join(import.meta.dirname, '..');
const BASELINE = join(root, 'src/lib/test/perf/growth/growth-baseline.json');
const BUNDLE = join(root, '.bench-out/growth-client/growth-client.js');

const args = process.argv.slice(2);
for (const arg of args)
	if (arg.startsWith('--') && !['--json', '--update'].includes(arg))
		throw new Error(`unknown benchmark option: ${arg}`);
const UPDATE = args.includes('--update');
const JSON_OUT = args.includes('--json');
const only = args.filter((arg) => !arg.startsWith('--'));
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 3);

if (!Number.isSafeInteger(ROUNDS) || ROUNDS < 1)
	throw new Error('BENCH_ROUNDS must be a positive integer');

let content;
try {
	content = readFileSync(BUNDLE, 'utf8');
} catch {
	console.error(`missing ${BUNDLE} — the npm script builds it; run \`bun run bench:growth\`.`);
	process.exit(1);
}

// `--stack-size`: a deeply NESTED fixture (tree-depth) builds one effect frame per level, and the
// default page stack overflows around ten levels — far below where the growth it exists to measure
// becomes visible. Raising it changes no timing; it only lets the fixture mount.
const browser = await chromium.launch({
	args: ['--js-flags=--expose-gc --stack-size=8000']
});
let results;
let required;
const diagnostics = [];
try {
	const page = await browser.newPage();
	page.on('pageerror', (error) => diagnostics.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'warning' || message.type() === 'error')
			diagnostics.push(message.text());
	});
	await page.goto('about:blank');
	await page.addScriptTag({ content });
	// eslint-disable-next-line no-undef
	const names = await page.evaluate(() => globalThis.GrowthBench.fixtureNames);
	for (const name of only)
		if (!names.includes(name)) throw new Error(`unknown growth scenario: ${name}`);
	required = only.length ? [...new Set(only)] : names;
	results = await page.evaluate(
		// eslint-disable-next-line no-undef
		(options) => globalThis.GrowthBench.run(options),
		{ rounds: ROUNDS, only: required }
	);
} finally {
	await browser.close();
}
if (diagnostics.length)
	throw new Error(`unexpected browser diagnostics:\n${diagnostics.join('\n')}`);

const measured = Object.fromEntries(results.map((row) => [row.name, growth(row).endpoint]));
let baseline;
try {
	baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
} catch (error) {
	if (!UPDATE || error.code !== 'ENOENT') throw error;
}
if (UPDATE) {
	const candidate = {
		...baseline,
		note: 'Historical endpoint exponents; all-point fits also face the absolute ceiling. Timing growth is empirical, not load-independent.',
		recorded: new Date().toISOString().slice(0, 10),
		exponents: { ...baseline?.exponents, ...measured }
	};
	const checked = evaluateGrowth(results, candidate, required);
	if (checked.failures.length) throw new Error(checked.failures.join('\n'));
	writeFileSync(BASELINE, JSON.stringify(candidate, null, '\t') + '\n');
	if (JSON_OUT) console.log(JSON.stringify({ results, ...checked, updated: true }, null, '\t'));
	else console.log(`baseline updated → ${BASELINE}`);
	process.exit(0);
}
const { exponents, failures } = evaluateGrowth(results, baseline, required);
if (JSON_OUT) {
	console.log(
		JSON.stringify(
			{ results, exponents, failures, baseline: baseline.recorded, known: baseline.known ?? {} },
			null,
			'\t'
		)
	);
	process.exit(failures.length ? 1 : 0);
}

const load = loadavg()[0] ?? 0;
console.log(
	'\nMount growth shape — t ∝ n^k over four sizes (1.00 = linear, 2.00 = quadratic)\n\n' +
		`  ${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}, chromium, best of ${ROUNDS}, load ${load.toFixed(2)}\n` +
		'  k fits all four log timings; load, GC and fixed overhead can still affect the estimate.\n'
);
console.log('  family        unit      n=50    n=100    n=200    n=400        k');
for (const row of results) {
	console.log(
		`  ${row.name.padEnd(13)} ${row.unit.padEnd(7)} ` +
			row.ms.map((ms) => `${ms.toFixed(1)} ms`.padStart(11)).join('') +
			`  ${exponents[row.name].fitted.toFixed(2).padStart(7)}`
	);
}
console.log('');

if (failures.length > 0) {
	console.error('bench:growth gate FAILED');
	for (const failure of failures) console.error(`  ✗ ${failure}`);
	console.error(
		'\nA rising exponent means a per-child read of something owner-wide — a getter over the\n' +
			'parent’s collection that every child reads. The fix is an equality gate (`$derived` whose\n' +
			'value is primitive and usually unchanged) plus an early return instead of building a list.\n' +
			'Worked examples: AccordionBondBase.focusedId, TreeBondBase.visibleHeaderIds.\n'
	);
	process.exit(1);
}

// A baselined number is not an endorsed one. Anything carrying a `known` note is an open defect
// held at its current value so it cannot get worse — printed every run so it stays visible rather
// than curing into "the way it is".
for (const [name, note] of Object.entries(baseline.known ?? {})) {
	if (measured[name] === undefined) continue;
	console.warn(
		`  ! ${name} k=${measured[name].toFixed(2)} is a KNOWN DEFECT, not a target.\n    ${note}\n`
	);
}

console.log(`gate OK — baseline ${baseline.recorded}\n`);
