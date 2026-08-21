/**
 * In-page half of `bun run bench:growth`. `scripts/bench-growth.mjs` builds it, injects it and
 * gates the result.
 *
 * A `.svelte.ts` because mounting components needs the client runtime; there is no `$state` here —
 * this harness only ever mounts, never updates.
 */
import { flushSync, mount, unmount } from 'svelte';
import { DEFAULT_COUNTS, FIXTURES } from './fixtures.js';

export type Options = { rounds?: number; only?: string[] };
export type Result = {
	name: string;
	unit: string;
	counts: number[];
	ms: number[];
	/** Live elements at each count — the proof the fixture actually rendered its n children. */
	elements: number[];
};

/**
 * Drain before a timed mount, never inside one. These fixtures allocate enough that a collection
 * landing mid-sample moves it further than the effect being measured, and the later, larger points
 * would otherwise inherit every earlier mount's garbage — which shows up as growth that belongs to
 * the collector rather than to the component. Needs `--expose-gc`, which the driver passes.
 */
async function drain(): Promise<void> {
	const gc = (globalThis as { gc?: () => void }).gc;
	if (!gc) return;
	for (let i = 0; i < 2; i++) {
		gc();
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mountOnce(component: any, n: number): Promise<{ ms: number; elements: number }> {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const started = performance.now();
	const app = mount(component, { target, props: { n } });
	// An unflushed mount has not done the work — the client-side analogue of never reading SSR's
	// lazy `body`.
	flushSync();
	const ms = performance.now() - started;
	// Count the whole document, not just `target`: a portalling family (Select, DropdownMenu) puts
	// its content in a host elsewhere in the body, and counting only the mount target would report
	// the trigger and call it the whole component.
	const elements = document.body.getElementsByTagName('*').length;
	unmount(app);
	target.remove();
	return { ms, elements };
}

export async function run(options: Options = {}): Promise<Result[]> {
	const rounds = options.rounds ?? 3;
	const only = options.only?.length ? new Set(options.only) : undefined;
	const results: Result[] = [];

	for (const fixture of FIXTURES) {
		if (only && !only.has(fixture.name)) continue;
		const counts = fixture.counts ?? DEFAULT_COUNTS;
		const ms: number[] = [];
		const elements: number[] = [];
		for (const n of counts) {
			let best = Infinity;
			let census = 0;
			for (let round = 0; round < rounds; round++) {
				await drain();
				const sample = await mountOnce(fixture.component, n);
				best = Math.min(best, sample.ms);
				census = sample.elements;
			}
			ms.push(best);
			elements.push(census);
		}

		// A fixture that does not render more for a larger `n` is measuring nothing, and its
		// exponent is meaningless — `select` did exactly this before it was given a portal host, and
		// reported a tidy k = −0.07 that would have been baselined as "linear". Fail loudly instead:
		// a silent pass on an empty fixture is the failure mode that lets the next O(n²) through.
		const grew = elements.at(-1)! - elements[0]!;
		const expected = (counts.at(-1)! - counts[0]!) * 0.5;
		if (grew < expected) {
			throw new Error(
				`fixture "${fixture.name}" does not scale with n: ` +
					`${elements[0]} elements at n=${counts[0]}, ${elements.at(-1)} at n=${counts.at(-1)}. ` +
					'It is not rendering its children — check for a missing portal host or context.'
			);
		}

		results.push({ name: fixture.name, unit: fixture.unit, counts: [...counts], ms, elements });
	}
	return results;
}
