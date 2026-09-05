/**
 * The client half of the head-to-head: mount, hydrate, targeted update, update storm, live DOM
 * census and retained heap, for both sides of every family. Runs INSIDE the browser page;
 * `scripts/bench-vs-client.mjs` builds it, injects it and prints the report.
 *
 * Same discipline as `nesting-client.svelte.ts`, and for the same reasons:
 *   - Retain raw samples and summarize each endpoint with its median.
 *   - Counterbalance family/side order and drain between arms outside the timed region.
 *   - `flushSync()` inside every timed region — an update that has not flushed has not done the
 *     work, and is the client-side analogue of never reading SSR's lazy `body`.
 *
 * A `.svelte.ts` because the update legs need a `$state` props object.
 */
import { flushSync, hydrate, mount, unmount } from 'svelte';
import { FAMILIES } from './families.js';
import { assertButtons } from './parity';
import { median, roundOrder, validateSampling } from '../samples';

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
type Metric = 'mount' | 'hydrate' | 'targeted' | 'broad';

export type SideResult = {
	samples: Record<Metric, Record<string, number[]>>;
	mount: Record<string, number>;
	hydrate: Record<string, number>;
	/** One prop change on a single probe unit embedded in a tree of `n` others. */
	targeted: Record<string, number>;
	/** Per-iteration cost of a change every unit reads. */
	broad: Record<string, number>;
	census: Record<string, Census>;
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

/** Full collection outside timing; yield so teardown work cannot leak into the next arm. */
async function drain(): Promise<void> {
	const gc = (globalThis as { gc?: () => void }).gc;
	if (!gc) throw new Error('benchmark requires exposed GC');
	gc();
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function record(result: SideResult, metric: Metric, key: string, value: number): void {
	if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid ${metric} sample: ${value}`);
	const samples = (result.samples[metric][key] ??= []);
	samples.push(value);
	result[metric][key] = median(samples);
}

export async function run(
	options: Options = {}
): Promise<Record<string, Record<Side, SideResult>>> {
	const rounds = options.rounds ?? 19;
	const warmup = options.warmup ?? 3;
	const storm = options.storm ?? 100;
	const broadIterations = options.broadIterations ?? 4;
	validateSampling(rounds, warmup);
	for (const value of [storm, broadIterations]) {
		if (!Number.isSafeInteger(value) || value < 1)
			throw new Error('invalid update iteration count');
	}
	for (const name of options.families ?? []) {
		if (!FAMILIES.some((family) => family.name === name))
			throw new Error(`unknown family: ${name}`);
	}
	const ssr = options.ssr ?? {};
	const families = options.families?.length
		? FAMILIES.filter((f) => options.families!.includes(f.name))
		: FAMILIES;

	// Check before any timed work; an absent hydrate arm must never become a blank report cell.
	for (const family of families)
		for (const side of SIDES)
			for (const n of family.clientCounts ?? COUNTS) {
				if (!ssr[`${family.name}:${side}:${n}`])
					throw new Error(`missing hydration markup: ${family.name}/${side}/${n}`);
			}
	const results: Record<string, Record<Side, SideResult>> = {};
	for (const family of families) {
		results[family.name] = {} as Record<Side, SideResult>;
		for (const side of SIDES) {
			results[family.name]![side] = {
				samples: { mount: {}, hydrate: {}, targeted: {}, broad: {} },
				mount: {},
				hydrate: {},
				targeted: {},
				broad: {},
				census: {}
			};
		}
	}

	for (let round = 0; round < rounds; round++) {
		// Iterate families outermost so a family with its own counts stays interleaved between its
		// two sides, which is the pairing the comparison depends on.
		for (const family of roundOrder(families, round)) {
			for (const n of roundOrder(family.clientCounts ?? COUNTS, round)) {
				for (const side of roundOrder(SIDES, round)) {
					await drain();
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
					if (family.name === 'button')
						assertButtons(target, n, `t${broadIterations - 1}`, `b${storm - 1}`);

					await unmount(app);
					target.remove();

					// ── hydrate over the server's own markup ─────────────────────────────────────
					let hydrateMs = NaN;
					const html = ssr[`${family.name}:${side}:${n}`];
					if (html) {
						await drain();
						const hydrateTarget = makeTarget();
						hydrateTarget.innerHTML = html;
						const t3 = performance.now();
						const hydrated = hydrate(component, {
							target: hydrateTarget,
							props: makeProps(n)
						});
						flushSync();
						hydrateMs = performance.now() - t3;
						if (family.name === 'button') assertButtons(hydrateTarget, n);
						await unmount(hydrated);
						hydrateTarget.remove();
					}

					if (!measured) continue;
					record(result, 'mount', k, mountMs);
					record(result, 'targeted', k, targetedMs);
					record(result, 'broad', k, broadMs);
					record(result, 'hydrate', k, hydrateMs);
				}
			}
		}
	}

	return results;
}

/**
 * Mount one tree and HOLD it, so the driver can take a heap snapshot while it is live.
 *
 * The heap leg used to run in here against `performance.memory.usedJSHeapSize`, and that number
 * was not trustworthy: it is page-wide, so it carries V8's own fragmentation and every other
 * allocation the page has made, and the ratio it reported for a card (+730%) was an order of
 * magnitude off what the retained objects actually are (+85%). A real snapshot answers the
 * question the column asks — bytes of reachable object per unit — and only the driver can take
 * one, because it needs CDP. So the measurement moved out and this pair moved in.
 */
export function hold(family: string, side: Side, n: number): void {
	const entry = FAMILIES.find((f) => f.name === family);
	if (!entry) throw new Error(`[vs-bench] no family "${family}"`);
	held?.();
	const target = makeTarget();
	const props = makeProps(n);
	heldProps = props;
	const app = mount(entry[side], { target, props });
	flushSync();
	held = () => {
		unmount(app);
		target.remove();
		held = undefined;
		heldProps = undefined;
	};
}

/**
 * Drive the BROAD axis on a held tree: `tint` is the one prop every unit reads (each root spreads it
 * as its `class`), so writing it invalidates every unit. The profiler drives this between flushes —
 * `bench-vs-profile.mjs --broad`. The measurement itself stays in `bench-vs-shadcn:client`; this
 * exists so the profiler can attribute the axis, which a mount profile cannot see.
 */
export function broadTick(tint: string): void {
	if (!heldProps) throw new Error('[vs-bench] broadTick without hold()');
	heldProps.tint = tint;
}

export function release(): void {
	held?.();
}

let held: (() => void) | undefined;
let heldProps: { n: number; tint: string; bump: string } | undefined;

export const GEOMETRY = { SIDES, COUNTS, LOW, HIGH };

// Re-exported so an ad-hoc probe in the page can drive a single mount without another bundle.
export { FAMILIES };
export const svelte = { mount, unmount, hydrate, flushSync };
