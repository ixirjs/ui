/**
 * Growth-shape gate. Run with `bun run bench:growth`.
 *
 * Mounts each collection-owning family at four sizes in a real browser and fits `t ∝ n^k`.
 * `k ≈ 1` is linear; anything approaching 2 is a per-child read of an owner-wide value, which is the
 * defect class documented in `docs/research/perf-vs-shadcn-2026-08.md` §7.
 *
 * Why the exponent and not milliseconds: **k is machine-independent**. A slow or loaded machine
 * scales every point together and leaves the ratio between them alone, so this gate is meaningful on
 * any box — unlike `ssr-baseline.json`, whose µs budgets are pinned to the machine that recorded
 * them and must be run with `--no-gate` anywhere else. That is what makes this one safe to put in CI.
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

const root = join(import.meta.dirname, '..');
const BASELINE = join(root, 'src/lib/test/perf/growth/growth-baseline.json');
const BUNDLE = join(root, '.bench-out/growth-client/growth-client.js');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const JSON_OUT = args.includes('--json');
const only = args.filter((arg) => !arg.startsWith('--'));
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 3);

/**
 * Headroom over a recorded exponent before the gate fails.
 *
 * Generous on purpose. k is stable where µs is not, but it is fitted from four timings and the
 * smallest point is the noisiest, so an unchanged tree still wanders ~0.1–0.2. The defects this
 * exists to catch land at 1.5–2.5, far outside that. A tight band here would produce flakes and
 * the gate would be switched off, which is the only outcome worse than not having it.
 */
const TOLERANCE = 0.3;
/** Absolute ceiling, regardless of what a baseline recorded. Nothing here should approach 1.5. */
const CEILING = 1.5;

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
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ content });
const results = await page.evaluate(
	// eslint-disable-next-line no-undef
	(options) => globalThis.GrowthBench.run(options),
	{ rounds: ROUNDS, only }
);
await browser.close();

const exponent = (row) =>
	Math.log(row.ms.at(-1) / row.ms[0]) / Math.log(row.counts.at(-1) / row.counts[0]);

const measured = Object.fromEntries(
	results.map((row) => [row.name, Number(exponent(row).toFixed(2))])
);

if (JSON_OUT) {
	console.log(JSON.stringify({ results, exponents: measured }, null, '\t'));
	process.exit(0);
}

const load = loadavg()[0] ?? 0;
console.log(
	'\nMount growth shape — t ∝ n^k over four sizes (1.00 = linear, 2.00 = quadratic)\n\n' +
		`  ${cpus()[0]?.model ?? 'unknown'} ×${cpus().length}, chromium, best of ${ROUNDS}, load ${load.toFixed(2)}\n` +
		'  k is a ratio between points, so machine speed and load cancel — unlike a µs budget.\n'
);
console.log('  family        unit      n=50    n=100    n=200    n=400        k');
for (const row of results) {
	console.log(
		`  ${row.name.padEnd(13)} ${row.unit.padEnd(7)} ` +
			row.ms.map((ms) => `${ms.toFixed(1)} ms`.padStart(11)).join('') +
			`  ${exponent(row).toFixed(2).padStart(7)}`
	);
}
console.log('');

let baseline;
try {
	baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
} catch {
	baseline = undefined;
}

if (UPDATE) {
	writeFileSync(
		BASELINE,
		JSON.stringify(
			{
				note: 'Fitted mount-growth exponents. Machine-independent — do NOT re-record these to make a regression pass.',
				recorded: new Date().toISOString().slice(0, 10),
				exponents: { ...baseline?.exponents, ...measured }
			},
			null,
			'\t'
		) + '\n'
	);
	console.log(`baseline updated → ${BASELINE}\n`);
	process.exit(0);
}

if (!baseline) {
	console.log('no baseline recorded — run with `-- --update` to record one\n');
	process.exit(0);
}

const failures = [];
for (const [name, k] of Object.entries(measured)) {
	const was = baseline.exponents?.[name];
	if (was === undefined) {
		failures.push(`${name}: no baseline entry — record one with \`-- --update\``);
		continue;
	}
	if (k > CEILING) {
		failures.push(
			`${name}: k=${k.toFixed(2)} exceeds the absolute ceiling ${CEILING.toFixed(2)} — ` +
				'mounting n children is superlinear. See docs/research/perf-vs-shadcn-2026-08.md §7.'
		);
	} else if (k > was + TOLERANCE) {
		failures.push(
			`${name}: k=${k.toFixed(2)} exceeds ${(was + TOLERANCE).toFixed(2)} (baseline ${was.toFixed(2)})`
		);
	}
}

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
