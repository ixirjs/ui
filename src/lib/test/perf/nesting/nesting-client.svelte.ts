/**
 * Nested components vs nested module snippets — the CSR half. This file runs INSIDE the browser
 * page; `scripts/bench-nesting-client.mjs` is the driver that builds it, injects it and prints the
 * report. It is a `.svelte.ts` because the update legs need a `$state` props object.
 *
 * The SSR half found that the arms emit byte-identical markup, anchors included, so nothing
 * structural distinguishes them on the server. Everything this file measures is what happens after
 * that markup reaches a client: how long a boundary takes to instantiate, whether a props proxy
 * propagates a change more cheaply than a re-invoked snippet body, what hydration pays for the
 * anchors, and how much live heap the two seams leave behind.
 *
 * Same measurement discipline as the SSR half and for the same reasons:
 *   - Floor each ENDPOINT across rounds, then take the slope. Never floor per-round slopes.
 *   - Arms interleave at the innermost level so drift and GC pauses hit all three equally.
 *   - `flushSync()` inside every timed region: a mount or an update that has not flushed has not
 *     done the work, and is the client-side analogue of never reading SSR's lazy `body`.
 */
import { flushSync, hydrate, mount, unmount } from 'svelte';
import Nesting from './nesting-ablation.test.svelte';
import type { NestingArm } from './types';

const ARMS: NestingArm[] = ['component', 'component-spread', 'snippet', 'snippet-packet'];

const LOW = 100;
const HIGH = 800;
const SHALLOW = 2;
const DEEP = 8;

type Point = { n: number; depth: number };
const GRID: Point[] = [
	{ n: LOW, depth: SHALLOW },
	{ n: HIGH, depth: SHALLOW },
	{ n: LOW, depth: DEEP },
	{ n: HIGH, depth: DEEP }
];

export type Options = {
	rounds?: number;
	warmup?: number;
	updateIterations?: number;
	/** SSR markup keyed `arm:n:depth`, rendered by the driver from the SSR bundle. */
	ssr?: Record<string, string>;
};

export type Census = { elements: number; comments: number; texts: number };
export type ArmResult = {
	mount: Record<string, number>;
	hydrate: Record<string, number>;
	targeted: Record<string, number>;
	broad: Record<string, number>;
	census: Record<string, Census>;
	heap: Record<string, number>;
};

const key = (n: number, depth: number) => `${n}:${depth}`;

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

/** A fresh `$state` props packet. Mutating `deep`/`tint` on it is what drives the update legs. */
function makeProps(arm: NestingArm, p: Point) {
	// `$state(...)` is only legal as a declaration initializer, so this cannot be a bare `return`.
	const props = $state({ n: p.n, arm, depth: p.depth, tint: 't0', deep: 0 });
	return props;
}

const min = (into: Record<string, number>, k: string, value: number) => {
	into[k] = Math.min(into[k] ?? Infinity, value);
};

/**
 * Drain BEFORE a timed region, never inside it. Same reason as the SSR half: these arms are
 * allocation-heavy enough that a collection landing mid-sample moves it further than the effect
 * being measured, and a floor taken over samples that all contain a collection is a floor over
 * noise. Needs `--js-flags=--expose-gc`, which the driver passes; a no-op without it.
 *
 * Called ONCE PER ROUND rather than before each timed region, which is the opposite of the SSR
 * half. A major collection in Chromium against a live 20 MB tree costs seconds, and one before
 * every leg meant 256 of them — a single pass ran past fifteen minutes, so nobody would run it
 * three times, which is the one thing this benchmark requires. Draining at the top of a round
 * clears the previous round's sixteen torn-down trees, and the per-round floor absorbs the rest.
 */
const drain = () => (globalThis as { gc?: () => void }).gc?.();

export async function run(options: Options = {}): Promise<Record<string, ArmResult>> {
	const rounds = options.rounds ?? 12;
	const warmup = options.warmup ?? 3;
	const updates = options.updateIterations ?? 6;
	const ssr = options.ssr ?? {};

	const results: Record<string, ArmResult> = {};
	for (const arm of ARMS) {
		results[arm] = { mount: {}, hydrate: {}, targeted: {}, broad: {}, census: {}, heap: {} };
	}

	for (let round = 0; round < rounds; round++) {
		drain();

		for (const p of GRID) {
			for (const arm of ARMS) {
				const measured = round >= warmup;
				const k = key(p.n, p.depth);
				const result = results[arm]!;

				// ── mount ────────────────────────────────────────────────────────────────────────
				const target = makeTarget();
				const props = makeProps(arm, p);
				const t0 = performance.now();
				const app = mount(Nesting, { target, props });
				flushSync();
				const mountMs = performance.now() - t0;

				// Census once, on the first measured round: it is exact, so repeating it only costs
				// a full tree walk per round. A zero element count means the mount silently did
				// nothing, which would make every timing above it meaningless.
				if (measured && !result.census[k]) {
					const c = census(target);
					if (c.elements === 0) throw new Error(`empty mount for ${arm} at ${k}`);
					result.census[k] = c;
				}

				// ── targeted update: only the leaf of each unit reads `deep` ─────────────────────
				const t1 = performance.now();
				for (let i = 0; i < updates; i++) {
					props.deep = i + 1;
					flushSync();
				}
				const targetedMs = (performance.now() - t1) / updates;

				// ── broad update: every level renders `tint` ─────────────────────────────────────
				const t2 = performance.now();
				for (let i = 0; i < updates; i++) {
					props.tint = `t${i + 1}`;
					flushSync();
				}
				const broadMs = (performance.now() - t2) / updates;

				unmount(app);
				target.remove();

				// ── hydrate over the server's own markup ─────────────────────────────────────────
				let hydrateMs = NaN;
				const html = ssr[`${arm}:${p.n}:${p.depth}`];
				if (html) {
					const hydrateTarget = makeTarget();
					hydrateTarget.innerHTML = html;
					const t3 = performance.now();
					const hydrated = hydrate(Nesting, { target: hydrateTarget, props: makeProps(arm, p) });
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

	// ── live heap, measured separately: it needs the tree HELD, which every leg above tears down ──
	for (const p of GRID) {
		for (const arm of ARMS) {
			results[arm]!.heap[key(p.n, p.depth)] = await liveHeap(arm, p);
		}
	}

	return results;
}

/**
 * Bytes of live heap the mounted tree retains. Chromium only, and only meaningful with
 * `--enable-precise-memory-info` (otherwise `usedJSHeapSize` is bucketed to ~5 MB and every arm
 * reads the same). Returns 0 where the API is absent rather than inventing a number.
 */
async function liveHeap(arm: NestingArm, p: Point): Promise<number> {
	// `performance.memory` hands back a MemoryInfo SNAPSHOT, not a live view. Holding the object
	// and reading `.usedJSHeapSize` off it twice returns the same number both times, which is why
	// this leg first reported a flat zero for every arm. Re-read the getter each sample.
	const used = () =>
		(performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
	const gc = (globalThis as { gc?: () => void }).gc;
	if (used() === undefined || !gc) return 0;

	const target = makeTarget();
	// Two collections a task apart: the first drops the previous arm's tree, the second collects
	// what that one resurrected through finalisation.
	await settle(gc);
	const before = used()!;

	const app = mount(Nesting, { target, props: makeProps(arm, p) });
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

export const GEOMETRY = { ARMS, GRID, LOW, HIGH, SHALLOW, DEEP };
