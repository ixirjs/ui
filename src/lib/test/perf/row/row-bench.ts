/**
 * `bench:row` — what a DataGrid row's Bond costs, measured rather than modelled.
 *
 * Method is `bench:lanes`': floored slope between two instance counts, arms interleaved inside each
 * round so machine drift hits all three equally, minimum round reported because for CPU-bound work
 * the floor is the signal. Read the DIFFERENCES, never the absolutes — the absolutes move 20%
 * between sessions on this box and `ssr-bench.ts` says so twice.
 *
 * It was written to decide one question: §13 of `docs/research/perf-vs-shadcn-2026-08.md` put "one
 * Bond root per row" at ~11-12 µs of ~16 from the cost model rather than from a measurement, and
 * named removing it as the only lever that would change an order of magnitude. Measured here, the
 * Bond and its element were ~19 µs of ~28 — **70%** of a three-cell row — and the `lite` arm showed
 * ~60% of that was recoverable. Both are now history: `DataGrid.Row` builds a Bond only when the
 * consumer passes `factory`, and the `full` arm below is the record path.
 *
 * It stays because the decomposition is what keeps the row honest. `full - cells` is now the row
 * component itself, and `full - lite` is what still separates it from a bare hand-written row.
 *
 * Ungated on purpose: it is an attribution instrument, not a regression gate. `bench:ssr` gates the
 * datagrid layer and `bench:growth` gates its shape.
 */
import { render } from 'svelte/server';
import RowAblation, { type RowArm } from './row-ablation.test.svelte';

const ARMS: RowArm[] = ['full', 'lite', 'cells', 'floor'];
const LOW = 50;
const HIGH = 400;
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 30);
const WARMUP = 5;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 2);

const body = (arm: RowArm, n: number) => render(RowAblation, { props: { arm, n } }).body;

/** Bytes and hydration anchors per row, sloped so the grid's own constants cancel. */
const bytes = (arm: RowArm) => (body(arm, 16).length - body(arm, 8).length) / 8;
const commentCount = (arm: RowArm, n: number) => body(arm, n).match(/<!--/g)?.length ?? 0;
const anchors = (arm: RowArm) => (commentCount(arm, 16) - commentCount(arm, 8)) / 8;

function sample(arm: RowArm, n: number): number {
	(globalThis as { gc?: () => void }).gc?.();
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) void body(arm, n).length;
	return (performance.now() - start) / ITERATIONS;
}

const floorMs = new Map<string, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const n of [LOW, HIGH]) {
		for (const arm of ARMS) {
			const ms = sample(arm, n);
			if (round < WARMUP) continue;
			const key = `${arm}:${n}`;
			floorMs.set(key, Math.min(floorMs.get(key) ?? Infinity, ms));
		}
	}
}

const micros = (arm: RowArm) =>
	((floorMs.get(`${arm}:${HIGH}`)! - floorMs.get(`${arm}:${LOW}`)!) * 1000) / (HIGH - LOW);

console.log('\nDataGrid row, decomposed — µs per ROW of three cells\n');
console.log('  arm       µs/row    bytes/row   anchors/row   what it is');
const WHAT: Record<RowArm, string> = {
	full: 'DataGrid.Row (record) + 3 Cell',
	lite: 'bare prototype row + 3 Cell',
	cells: 'plain <div> + 3 DataGrid.Cell',
	floor: 'plain <div> + 3 plain <div>'
};
for (const arm of ARMS) {
	console.log(
		`  ${arm.padEnd(9)} ${micros(arm).toFixed(2).padStart(6)}  ${bytes(arm).toFixed(0).padStart(11)}   ${anchors(arm).toFixed(2).padStart(11)}   ${WHAT[arm]}`
	);
}

const rowBond = micros('full') - micros('cells');
const threeCells = micros('cells') - micros('floor');
console.log(
	`\n  the row component and element  ${rowBond.toFixed(2)} µs  ` +
		`(${((rowBond / micros('full')) * 100).toFixed(0)}% of the row)`
);
console.log(
	`  three cells                    ${threeCells.toFixed(2)} µs  ` +
		`(${(threeCells / 3).toFixed(2)} µs each)`
);
console.log(`  hand-written markup floor      ${micros('floor').toFixed(2)} µs`);

const overBare = micros('full') - micros('lite');
console.log(
	`  over a bare prototype row      ${overBare.toFixed(2)} µs  ` +
		`(${((overBare / micros('full')) * 100).toFixed(0)}% of the row) — preset resolution,` +
		` \`$preset\` composition and restProps\n`
);
