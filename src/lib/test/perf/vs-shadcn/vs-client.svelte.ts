/**
 * The client half of the head-to-head: mount, hydrate, targeted update, update storm, live DOM
 * census and retained heap, for both sides of every family. Runs INSIDE the browser page;
 * `scripts/bench-vs-client.mjs` builds it, injects it and prints the report.
 *
 * Same discipline as `nesting-client.svelte.ts`, and for the same reasons:
 *   - Floor each ENDPOINT across rounds, then take the slope. Never floor per-round slopes.
 *   - The two sides interleave at the innermost level so drift and GC pauses hit both equally.
 *   - `flushSync()` inside every timed region — an update that has not flushed has not done the
 *     work, and is the client-side analogue of never reading SSR's lazy `body`.
 *
 * A `.svelte.ts` because the update legs need a `$state` props object.
 */
import { flushSync, hydrate, mount, unmount } from 'svelte';
import { FAMILIES } from './families.js';

const SIDES = ['ixir', 'shadcn'] as const;
type Side = (typeof SIDES)[number];

const LOW = 100;
const HIGH = 800;
const COUNTS = [LOW, HIGH];

export type Options = {
	rounds?: number;
	warmup?: number;
	/** Length of the targeted storm — cheap, one unit, so it runs the full hundred. */
	storm?: number;
	/**
	 * Iterations of the BROAD leg. Deliberately small and separate from `storm`: a broad update at
	 * `n = 800` re-renders 800 units, so a hundred of them is minutes per side per round and nobody
	 * runs the benchmark three times, which is the one thing it requires. Four is what the nesting
	 * half uses, for the same reason.
	 */
	broadIterations?: number;
	/** SSR markup keyed `family:side:n`, rendered by the driver from the SSR bundle. */
	ssr?: Record<string, string>;
	families?: string[];
};

export type Census = { elements: number; comments: number; texts: number };
export type SideResult = {
	mount: Record<string, number>;
	hydrate: Record<string, number>;
	/** One prop change on a single probe unit embedded in a tree of `n` others. */
	targeted: Record<string, number>;
	/** Per-iteration cost of a change every unit reads. */
	broad: Record<string, number>;
	census: Record<string, Census>;
	heap: Record<string, number>;
};

function makeTarget(): HTMLElement {
	const target = document.createElement('div');
	document.body.appendChild(target);
	return target;
}

function census(target: Node): Census {
	const walker = document.createTreeWalker(
		target,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
	);
	const out: Census = { elements: 0, comments: 0, texts: 0 };
	while (walker.nextNode()) {
		const type = walker.currentNode.nodeType;
		if (type === Node.ELEMENT_NODE) out.elements++;
		else if (type === Node.COMMENT_NODE) out.comments++;
		else out.texts++;
	}
	return out;
}

function makeProps(n: number) {
	const props = $state({ n, tint: '', bump: '' });
	return props;
}

const min = (into: Record<string, number>, k: string, value: number) => {
	into[k] = Math.min(into[k] ?? Infinity, value);
};

/** Drain BEFORE a timed region, never inside it, and once per round — see the nesting half. */
const drain = () => (globalThis as { gc?: () => void }).gc?.();

export async function run(
	options: Options = {}
): Promise<Record<string, Record<Side, SideResult>>> {
	const rounds = options.rounds ?? 10;
	const warmup = options.warmup ?? 3;
	const storm = options.storm ?? 100;
	const broadIterations = options.broadIterations ?? 4;
	const ssr = options.ssr ?? {};
	const families = options.families?.length
		? FAMILIES.filter((f) => options.families!.includes(f.name))
		: FAMILIES;

	const results: Record<string, Record<Side, SideResult>> = {};
	for (const family of families) {
		results[family.name] = {} as Record<Side, SideResult>;
		for (const side of SIDES) {
			results[family.name]![side] = {
				mount: {},
				hydrate: {},
				targeted: {},
				broad: {},
				census: {},
				heap: {}
			};
		}
	}

	for (let round = 0; round < rounds; round++) {
		drain();
		// Iterate families outermost so a family with its own counts stays interleaved between its
		// two sides, which is the pairing the comparison depends on.
		for (const family of families) {
			for (const n of family.clientCounts ?? COUNTS) {
				for (const side of SIDES) {
					const measured = round >= warmup;
					const k = String(n);
					const result = results[family.name]![side];
					const component = family[side];

					// ── mount ────────────────────────────────────────────────────────────────────
					const target = makeTarget();
					const props = makeProps(n);
					const t0 = performance.now();
					const app = mount(component, { target, props });
					flushSync();
					const mountMs = performance.now() - t0;

					// Census once, on the first measured round: it is exact, so repeating it costs a
					// full tree walk for nothing. Zero elements means the mount silently did nothing,
					// which would make every timing above it meaningless.
					if (measured && !result.census[k]) {
						const c = census(target);
						if (c.elements === 0) throw new Error(`empty mount: ${family.name}/${side}`);
						result.census[k] = c;
					}

					// ── targeted: one probe unit changes; the other n do not ─────────────────────
					const t1 = performance.now();
					for (let i = 0; i < storm; i++) {
						props.bump = `b${i}`;
						flushSync();
					}
					const targetedMs = (performance.now() - t1) / storm;

					// ── broad: every unit reads `tint`, so every unit updates ────────────────────
					const t2 = performance.now();
					for (let i = 0; i < broadIterations; i++) {
						props.tint = `t${i}`;
						flushSync();
					}
					const broadMs = (performance.now() - t2) / broadIterations;

					unmount(app);
					target.remove();

					// ── hydrate over the server's own markup ─────────────────────────────────────
					let hydrateMs = NaN;
					const html = ssr[`${family.name}:${side}:${n}`];
					if (html) {
						const hydrateTarget = makeTarget();
						hydrateTarget.innerHTML = html;
						const t3 = performance.now();
						const hydrated = hydrate(component, {
							target: hydrateTarget,
							props: makeProps(n)
						});
						flushSync();
						hydrateMs = performance.now() - t3;
						unmount(hydrated);
						hydrateTarget.remove();
					}

					if (!measured) continue;
					min(result.mount, k, mountMs);
					min(result.targeted, k, targetedMs);
					min(result.broad, k, broadMs);
					if (!Number.isNaN(hydrateMs)) min(result.hydrate, k, hydrateMs);
				}
			}
		}
	}

	// ── live heap, measured separately: it needs the tree HELD, which every leg above tears down ──
	for (const family of families) {
		for (const n of family.clientCounts ?? COUNTS) {
			for (const side of SIDES) {
				results[family.name]![side].heap[String(n)] = await liveHeap(family[side], n);
			}
		}
	}

	return results;
}

/**
 * Bytes of live heap the mounted tree retains. Chromium only, and only meaningful with
 * `--enable-precise-memory-info`. Returns 0 where the API is absent rather than inventing a number.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function liveHeap(component: any, n: number): Promise<number> {
	// `performance.memory` hands back a SNAPSHOT, not a live view — re-read the getter each sample.
	const used = () =>
		(performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
	const gc = (globalThis as { gc?: () => void }).gc;
	if (used() === undefined || !gc) return 0;

	const target = makeTarget();
	await settle(gc);
	const before = used()!;

	const app = mount(component, { target, props: makeProps(n) });
	flushSync();
	await settle(gc);
	const after = used()!;

	unmount(app);
	target.remove();
	return after - before;
}

async function settle(gc: () => void): Promise<void> {
	for (let i = 0; i < 2; i++) {
		gc();
		await new Promise((r) => setTimeout(r, 0));
	}
}

export const GEOMETRY = { SIDES, COUNTS, LOW, HIGH };

// Re-exported so an ad-hoc probe in the page can drive a single mount without another bundle.
export { FAMILIES };
export const svelte = { mount, unmount, hydrate, flushSync };
