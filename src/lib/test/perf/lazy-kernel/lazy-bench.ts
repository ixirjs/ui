import { render } from 'svelte/server';
import LazyAblation, { type LazyArm } from './lazy-ablation.test.svelte';

const ARMS: LazyArm[] = ['ceiling', 'lazy', 'current'];
const LOW = 100;
const HIGH = 800;
const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 40);
const WARMUP = 5;
const ITERATIONS = Number(process.env.BENCH_ITER ?? 2);
const body = (arm: LazyArm, n: number) => render(LazyAblation, { props: { arm, n } }).body;
const visible = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');

const expected = visible(body('current', 3));
for (const arm of ARMS) {
	if (visible(body(arm, 3)) !== expected)
		throw new Error(`${arm} output differs from current Card`);
}

function sample(arm: LazyArm, n: number): number {
	(globalThis as { gc?: () => void }).gc?.();
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) void body(arm, n).length;
	return (performance.now() - start) / ITERATIONS;
}

const floor = new Map<string, number>();
for (let round = 0; round < ROUNDS; round++) {
	for (const n of [LOW, HIGH]) {
		for (const arm of ARMS) {
			const ms = sample(arm, n);
			if (round < WARMUP) continue;
			const key = `${arm}:${n}`;
			floor.set(key, Math.min(floor.get(key) ?? Infinity, ms));
		}
	}
}
const micros = (arm: LazyArm) =>
	((floor.get(`${arm}:${HIGH}`)! - floor.get(`${arm}:${LOW}`)!) * 1000) / (HIGH - LOW);
const anchors = (arm: LazyArm, n: number) => (body(arm, n).match(/<!--/g) ?? []).length;

console.log('arm       µs/card  Δ ceiling  anchors/card');
for (const arm of ARMS) {
	console.log(
		`${arm.padEnd(9)} ${micros(arm).toFixed(2).padStart(7)}  ${(micros(arm) - micros('ceiling'))
			.toFixed(2)
			.padStart(9)}  ${((anchors(arm, 12) - anchors(arm, 4)) / 8).toFixed(1).padStart(12)}`
	);
}
