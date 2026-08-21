/**
 * Browser half of the upstream A/B. Same `ablation.test.svelte` fixture as the SSR side, mounted in
 * Chromium so per-child registration from `onmount` — which SSR never runs — is actually paid.
 *
 * Reports the marginal cost of one unit (the slope between two counts, same shape as the SSR
 * bench), the live element census, and the mount cost at the high count.
 */
import { flushSync, mount, unmount, type Component } from 'svelte';
import Ablation from '../ablation.test.svelte';
import Parts from './ab-parts.test.svelte';

// Each case names its own component and props, so the collapsible attribution layers sit in the
// same interleaved sweep as the headline ones rather than in a second run with its own drift.
const CASES = [
	{ layer: 'plain', component: Ablation, props: { layer: 'plain' } },
	{ layer: 'cardroot', component: Ablation, props: { layer: 'cardroot' } },
	{ layer: 'card', component: Ablation, props: { layer: 'card' } },
	{ layer: 'collapsible', component: Ablation, props: { layer: 'collapsible' } },
	{ layer: 'collapsibleroot', component: Parts, props: { layer: 'collapsibleroot' } },
	{ layer: 'collapsiblehead', component: Parts, props: { layer: 'collapsiblehead' } },
	{ layer: 'collapsiblefull', component: Parts, props: { layer: 'collapsiblefull' } }
] as const;
type Case = (typeof CASES)[number];
const LOW = 100;
const HIGH = 800;

export type Row = {
	layer: string;
	microsPerUnit: number;
	msLow: number;
	msHigh: number;
	elementsPerUnit: number;
};

async function drain(): Promise<void> {
	const gc = (globalThis as { gc?: () => void }).gc;
	if (!gc) return;
	for (let i = 0; i < 2; i++) {
		gc();
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
}

async function mountOnce(kase: Case, n: number): Promise<{ ms: number; elements: number }> {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const started = performance.now();
	// Two fixtures with disjoint `layer` unions share one CASES table; the props are correct
	// per case, only the union isn't expressible.
	const app = mount(kase.component as Component<Record<string, unknown>>, {
		target,
		props: { n, ...kase.props }
	});
	// An unflushed mount has not done the work — the client analogue of SSR's lazy `body`.
	flushSync();
	const ms = performance.now() - started;
	const elements = target.getElementsByTagName('*').length;
	unmount(app);
	target.remove();
	return { ms, elements };
}

export async function run(options: { rounds?: number } = {}): Promise<Row[]> {
	const rounds = options.rounds ?? 8;
	// Floor each endpoint across interleaved rounds, then take the slope — flooring the endpoints
	// separately rather than the per-round slopes, for the pairing reason `ssr-bench.ts` documents.
	const floorLow = new Map<string, number>();
	const floorHigh = new Map<string, number>();
	const census = new Map<string, number>();

	for (let round = 0; round < rounds; round++) {
		for (const kase of CASES) {
			await drain();
			const low = await mountOnce(kase, LOW);
			await drain();
			const high = await mountOnce(kase, HIGH);
			if (round === 0) continue; // warm-up
			floorLow.set(kase.layer, Math.min(floorLow.get(kase.layer) ?? Infinity, low.ms));
			floorHigh.set(kase.layer, Math.min(floorHigh.get(kase.layer) ?? Infinity, high.ms));
			census.set(kase.layer, high.elements);
		}
	}

	return CASES.map(({ layer }) => ({
		layer,
		microsPerUnit: Number(
			(((floorHigh.get(layer)! - floorLow.get(layer)!) * 1000) / (HIGH - LOW)).toFixed(3)
		),
		msLow: Number(floorLow.get(layer)!.toFixed(3)),
		msHigh: Number(floorHigh.get(layer)!.toFixed(3)),
		elementsPerUnit: Number((census.get(layer)! / HIGH).toFixed(2))
	}));
}
