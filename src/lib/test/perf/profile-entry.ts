/**
 * CPU-profiling entry: renders one ablation layer in a loop so `node --cpu-prof` can attribute SSR
 * self time to functions. Not a gate and not a benchmark — the numbers here are for finding *where*
 * time goes, and `ssr-bench.ts` remains the only thing that says whether it got faster.
 *
 * Usage:
 *   BENCH_ENTRY=test/perf/profile-entry.ts BENCH_OUT=.bench-out/profile \
 *     vite build -c scripts/bench.vite.config.ts
 *   node --cpu-prof --cpu-prof-dir=.bench-out/profile .bench-out/profile/profile-entry.js card
 */
import { render } from 'svelte/server';
import { PerformanceObserver } from 'node:perf_hooks';
import Ablation, { type AblationLayer } from './ablation.test.svelte';
import DatagridAblation from './datagrid-ablation.test.svelte';
import MenuAblation from './menu-ablation.test.svelte';

const layer = (process.argv[2] ?? 'card') as AblationLayer | 'datagrid' | 'menu';
const budgetMs = Number(process.argv[3] ?? 4000);
const n = Number(process.argv[4] ?? 400);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STANDALONE: Record<string, any> = { datagrid: DatagridAblation, menu: MenuAblation };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fixture: any = STANDALONE[layer] ?? Ablation;
const props = STANDALONE[layer] ? { n } : { n, layer };

// `budgetMs = 0` prints the markup instead of timing it — the shape of what the seam emits is the
// first thing worth checking when a branch is proposed on the grounds that it emits less.
if (budgetMs === 0) {
	console.log(render(fixture, { props: { ...props, n: 1 } }).body);
	process.exit(0);
}

// Warm the JIT before the profiler's samples start mattering; a cold run is dominated by the
// compiler tiering up, which attributes time to whatever ran first rather than to what is hot.
let sink = 0;
for (let i = 0; i < 20; i++) sink += render(fixture, { props }).body.length;

/**
 * `budgetMs < 0` measures ALLOCATION instead of time, as scavenges per 1000 rendered units.
 *
 * The young generation is a fixed size, so one scavenge means roughly one semi-space filled: the
 * count over a fixed render count is proportional to bytes allocated. That matters because GC is a
 * fifth of SSR here, and neither available allocation instrument works — `--heap-prof` reports V8's
 * sampling *allocation* profile, which drops every sample whose object was already collected, i.e.
 * exactly the short-lived render garbage; and wall time cannot resolve a change this small on a
 * machine that drifts 11% between runs.
 *
 * Unlike µs, this number is not thermal. Two runs of unchanged code give the same count.
 */
if (budgetMs < 0) {
	const renders = -budgetMs;
	let scavenges = 0;
	let major = 0;
	new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) {
			// `kind` is on the entry's detail in Node's GC entries: 1 = scavenge, 2 = minor mark-compact,
			// 4 = incremental, 8 = weak callbacks. Anything not a scavenge is counted separately —
			// majors are driven by promotion rather than by allocation rate and are far noisier.
			const kind = (entry as unknown as { detail?: { kind?: number } }).detail?.kind;
			if (kind === 1) scavenges++;
			else major++;
		}
	}).observe({ entryTypes: ['gc'] });

	// Chunked, with a macrotask between chunks. GC entries reach an observer only on a later
	// macrotask, and a single uninterrupted loop overruns the observer's buffer and delivers NOTHING
	// — 600 renders straight through reported zero scavenges while 60 reported seventeen. The yields
	// cost no allocation of their own; they only let the queue drain.
	for (let done = 0; done < renders; done += 25) {
		for (let i = 0; i < Math.min(25, renders - done); i++) {
			sink += render(fixture, { props }).body.length;
		}
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
	await new Promise((resolve) => setTimeout(resolve, 0));
	const units = renders * n;
	console.log(
		`${layer}: ${((scavenges * 1000) / units).toFixed(2)} scavenges/1k units ` +
			`(${scavenges} over ${units} units, ${major} major) (sink ${sink})`
	);
	process.exit(0);
}

const start = performance.now();
let renders = 0;
while (performance.now() - start < budgetMs) {
	sink += render(fixture, { props }).body.length;
	renders++;
}
const elapsed = performance.now() - start;

console.log(
	`${layer}: ${renders} renders × ${n} units in ${elapsed.toFixed(0)} ms ` +
		`= ${((elapsed * 1000) / (renders * n)).toFixed(2)} µs/unit (sink ${sink})`
);
