// Throwaway: does an SSR render show the same superlinear growth the client mount did?
import { render } from 'svelte/server';
import { FAMILIES } from './families.js';

const COUNTS = [50, 100, 200, 400];
const only = process.argv.slice(2);
for (const family of FAMILIES) {
	if (only.length && !only.includes(family.name)) continue;
	const times: number[] = [];
	for (const n of COUNTS) {
		let best = Infinity;
		for (let i = 0; i < 5; i++) {
			const start = performance.now();
			if (render(family.ixir, { props: { n } }).body.length === 0) throw new Error('empty');
			best = Math.min(best, performance.now() - start);
		}
		times.push(best);
	}
	const k = Math.log(times.at(-1)! / times[0]!) / Math.log(COUNTS.at(-1)! / COUNTS[0]!);
	console.log(
		`${family.name.padEnd(10)} ${times.map((t) => t.toFixed(1).padStart(9)).join('')}   k=${k.toFixed(2)}`
	);
}
