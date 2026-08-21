/**
 * A/B SSR bench: this working tree vs the published `ixirjs/ui` tree, same harness both sides.
 *
 * Methodology is `ssr-bench.ts` trimmed to the layers whose CONSUMER API is identical on both
 * sides, so the two bundles render byte-comparable markup: floor each endpoint across interleaved
 * rounds, take the slope, and report the marginal cost of one fixture unit. Gate and baseline are
 * dropped — the driver compares the two sides' medians instead.
 *
 * Env: BENCH_JSON (result path), BENCH_ROUNDS, BENCH_ITER.
 */
import { render } from 'svelte/server';
import { createHash } from 'node:crypto';
import { PerformanceObserver } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import Ablation, { type AblationLayer } from '../ablation.test.svelte';

const LAYERS: AblationLayer[] = ['plain', 'cardroot', 'card', 'collapsible'];

const LOW = 100;
const HIGH = 800;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 8);
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 16);
const WARMUP_ROUNDS = 3;
const GC_WARMUP_MS = 120;
const GC_BUDGET_MS = 400;

function renderMs(layer: AblationLayer, n: number): number {
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		// `body` is a LAZY GETTER — read it inside the timed region or the render escapes measurement.
		if (render(Ablation, { props: { n, layer } }).body.length === 0) {
			throw new Error(`empty render for layer "${layer}"`);
		}
	}
	return (performance.now() - start) / ITERATIONS;
}

/** Bytes, markup SHA and hydration-anchor count for one unit. */
function fingerprint(layer: AblationLayer) {
	const body = render(Ablation, { props: { n: 3, layer } }).body;
	return {
		bytesPerUnit: Math.round(body.length / 3),
		anchorsPerUnit: Math.round((body.match(/<!--/g)?.length ?? 0) / 3),
		sha: createHash('sha256').update(body).digest('hex').slice(0, 12)
	};
}

let gcAccumulated = 0;
new PerformanceObserver((list) => {
	for (const entry of list.getEntries()) gcAccumulated += entry.duration;
}).observe({ entryTypes: ['gc'] });

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function renderFor(layer: AblationLayer, budgetMs: number): number {
	const start = performance.now();
	let elapsed = 0;
	let sink = 0;
	do {
		sink += render(Ablation, { props: { n: HIGH, layer } }).body.length;
		elapsed = performance.now() - start;
	} while (elapsed < budgetMs);
	if (sink === 0) throw new Error(`empty render for layer "${layer}"`);
	return elapsed;
}

async function measureGcShare(layer: AblationLayer): Promise<number> {
	renderFor(layer, GC_WARMUP_MS);
	await flush();
	gcAccumulated = 0;
	const wall = renderFor(layer, GC_BUDGET_MS);
	await flush();
	return wall > 0 ? gcAccumulated / wall : 0;
}

const floorLow = new Map<AblationLayer, number>();
const floorHigh = new Map<AblationLayer, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const layer of LAYERS) {
		const low = renderMs(layer, LOW);
		const high = renderMs(layer, HIGH);
		if (round < WARMUP_ROUNDS) continue;
		floorLow.set(layer, Math.min(floorLow.get(layer) ?? Infinity, low));
		floorHigh.set(layer, Math.min(floorHigh.get(layer) ?? Infinity, high));
	}
}

const result: Record<string, unknown> = {};
for (const layer of LAYERS) {
	const micros = ((floorHigh.get(layer)! - floorLow.get(layer)!) * 1000) / (HIGH - LOW);
	result[layer] = {
		micros: Number(micros.toFixed(3)),
		gcShare: Number((await measureGcShare(layer)).toFixed(3)),
		...fingerprint(layer)
	};
}

console.log(`\n${process.env.BENCH_SIDE ?? 'side'} — SSR marginal cost per unit\n`);
for (const layer of LAYERS) {
	const row = result[layer] as Record<string, number | string>;
	console.log(
		`  ${layer.padEnd(12)} ${String(row.micros).padStart(7)} µs  ` +
			`gc ${(Number(row.gcShare) * 100).toFixed(1).padStart(5)}%  ` +
			`${String(row.bytesPerUnit).padStart(4)} B  ${String(row.anchorsPerUnit).padStart(3)} anchors  sha=${row.sha}`
	);
}
console.log('');

if (process.env.BENCH_JSON)
	writeFileSync(process.env.BENCH_JSON, JSON.stringify(result, null, '\t'));
