import { describe, expect, it } from 'vitest';
import {
	createVirtualLayout,
	type VirtualBacking,
	type VirtualLayout
} from './virtual-layout.svelte';

/**
 * A mutable source shaped like an adapter's. `version` returns the keys array, so a reorder that
 * preserves `count` still invalidates the layout.
 */
class Source {
	keys = $state<string[]>([]);
	scroll = $state(0);
	viewport = $state(100);
	overscan = $state(0);
	pinned = $state<number | undefined>(undefined);
	estimate = $state<number>(10);

	constructor(count: number, prefix = 'item') {
		this.keys = Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
	}

	backing(overrides: Partial<VirtualBacking> = {}): VirtualBacking {
		return backingOf(this, overrides);
	}
}

// Outside the class so `estimateSize` stays a getter — inside an object literal `this` would be the
// literal, not the source.
function backingOf(source: Source, overrides: Partial<VirtualBacking>): VirtualBacking {
	return {
		count: () => source.keys.length,
		keyAt: (index) => source.keys[index],
		get estimateSize() {
			return source.estimate;
		},
		viewportSize: () => source.viewport,
		scrollOffset: () => source.scroll,
		overscan: () => source.overscan,
		pinnedIndex: () => source.pinned,
		version: () => source.keys,
		...overrides
	};
}

const indexes = (model: VirtualLayout) => model.items.map((item) => item.index);
const starts = (model: VirtualLayout) => model.items.map((item) => item.start);

describe('createVirtual — uniform layout', () => {
	it('windows a 10k source and answers by arithmetic', () => {
		const model = createVirtualLayout(new Source(10_000).backing());

		// viewport 100 / size 10 => 0..9. Item 10 starts at 100, where the viewport ends, so it
		// overlaps by nothing.
		expect(indexes(model)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(starts(model)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
		expect(model.totalSize).toBe(100_000);
	});

	// Asserted as absence of work, not as a value: a uniform layout must never touch the source per
	// item, and values alone cannot tell arithmetic from a walk with the same answer.
	it('answers a uniform layout without walking the source', () => {
		let keyReads = 0;
		const source = new Source(10_000);
		const model = createVirtualLayout(
			source.backing({
				keyAt: (index) => {
					keyReads += 1;
					return source.keys[index];
				}
			})
		);

		// Total size and window bounds are pure arithmetic — no index resolves to a key.
		expect(model.totalSize).toBe(100_000);
		expect(model.range).toEqual({ first: 0, last: 9 });
		expect(keyReads).toBe(0);

		// Rendering touches exactly the window, not the ten thousand behind it.
		const window = model.items;
		expect(window.length).toBe(10);
		expect(keyReads).toBe(10);
	});

	it('tracks scroll and clamps the window at both ends', () => {
		const source = new Source(20);
		const model = createVirtualLayout(source.backing());

		source.scroll = 100;
		expect(indexes(model)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);

		// Past the end — rubber-band, or a source that shrank while scrolled down. The window must
		// still resolve to real items.
		source.scroll = 10_000;
		expect(model.range).toEqual({ first: 19, last: 19 });
		expect(indexes(model)).toEqual([19]);
	});

	it('expands the window by overscan on both sides', () => {
		const source = new Source(100);
		const model = createVirtualLayout(source.backing());
		source.scroll = 300;
		source.overscan = 2;

		// visible 30..39 (item 40 starts at 400, where the viewport ends), overscan 2 => 28..41
		expect(model.range).toEqual({ first: 28, last: 41 });
	});

	// A CSS height (`height: '100%'`) cannot seed the server-rendered viewport, so the layout runs at
	// zero until measured. An empty window here means blank markup until hydration.
	it('still renders a window when the viewport is not yet known', () => {
		const source = new Source(1000);
		source.viewport = 0;
		source.overscan = 4;
		const model = createVirtualLayout(source.backing());

		// Nothing is strictly visible in a zero-tall viewport, so overscan alone decides the window.
		expect(model.range).toEqual({ first: 0, last: 3 });
		expect(indexes(model)).toEqual([0, 1, 2, 3]);
		expect(model.totalSize).toBe(10_000);

		// With no overscan to fall back on either, the last visible index is -1 — only the lower clamp
		// stands between this and blank server-rendered markup.
		source.overscan = 0;
		expect(model.range).toEqual({ first: 0, last: 0 });
		expect(indexes(model)).toEqual([0]);
	});

	it('returns an empty window for an empty source', () => {
		const model = createVirtualLayout(new Source(0).backing());
		expect(model.items).toEqual([]);
		expect(model.totalSize).toBe(0);
		expect(model.offsetOf(5)).toBe(0);
	});

	it('follows a reactive estimate', () => {
		const source = new Source(100);
		const model = createVirtualLayout(source.backing());
		expect(model.totalSize).toBe(1000);

		source.estimate = 25;
		expect(model.totalSize).toBe(2500);
		expect(indexes(model)).toEqual([0, 1, 2, 3]);
	});
});

// The defaults are the contract: a caller omits `estimateSize`/`overscan` because this owns them, so
// changing one here silently changes every adopter.
describe('createVirtual — documented defaults', () => {
	it('applies them when the backing omits them', () => {
		const keys = Array.from({ length: 100 }, (_, index) => `item-${index}`);
		const model = createVirtualLayout({
			count: () => keys.length,
			keyAt: (index) => keys[index],
			viewportSize: () => 100,
			scrollOffset: () => 0
		});

		// estimateSize defaults to 40.
		expect(model.sizeOf(0)).toBe(40);
		expect(model.totalSize).toBe(4000);

		// Item 3 starts at 120, past a viewport of 100, so 0..2 is visible; overscan defaults to 4.
		expect(model.range).toEqual({ first: 0, last: 6 });
	});
});

describe('createVirtual — pinned item retention', () => {
	it('retains an index past the window, in index order', () => {
		const source = new Source(1000);
		const model = createVirtualLayout(source.backing());
		source.pinned = 900;

		expect(indexes(model).at(-1)).toBe(900);
		expect(model.items.at(-1)?.start).toBe(9000);
		expect(indexes(model).slice(0, 3)).toEqual([0, 1, 2]);
	});

	it('retains an index before the window at the front', () => {
		const source = new Source(1000);
		const model = createVirtualLayout(source.backing());
		source.scroll = 5000;
		source.pinned = 3;

		expect(indexes(model)[0]).toBe(3);
		expect(indexes(model)[1]).toBe(500);
	});

	it('does not duplicate an index already inside the window', () => {
		const source = new Source(100);
		const model = createVirtualLayout(source.backing());
		source.pinned = 5;

		expect(indexes(model).filter((index) => index === 5)).toHaveLength(1);
	});

	it('ignores a pinned index outside the source', () => {
		const source = new Source(10);
		const model = createVirtualLayout(source.backing());
		source.pinned = 999;

		expect(indexes(model).at(-1)).toBe(9);
	});
});

/**
 * The invariant the two paths exist to satisfy: measuring every item to exactly its estimate must
 * change nothing. Both then describe the same geometry, so a disagreement is an off-by-one — seen by
 * a consumer as the window jumping a row the instant the first `ResizeObserver` fires.
 */
describe('createVirtual — the two layout paths agree', () => {
	it('answers identically once every item is measured at its estimate', () => {
		const geometry = { count: 200, size: 10, viewport: 100 };

		for (const scroll of [0, 5, 100, 105, 995, 1990]) {
			const uniform = new Source(geometry.count);
			uniform.viewport = geometry.viewport;
			uniform.scroll = scroll;
			const byArithmetic = createVirtualLayout(uniform.backing());

			const measured = new Source(geometry.count);
			measured.viewport = geometry.viewport;
			measured.scroll = scroll;
			const byPrefixSum = createVirtualLayout(measured.backing());
			// Every size equals its estimate, so only the code path differs.
			for (let index = 0; index < geometry.count; index++) {
				byPrefixSum.measure(index, geometry.size);
			}

			expect({ scroll, ...byPrefixSum.range }).toEqual({ scroll, ...byArithmetic.range });
			expect(indexes(byPrefixSum)).toEqual(indexes(byArithmetic));
			expect(starts(byPrefixSum)).toEqual(starts(byArithmetic));
			expect(byPrefixSum.totalSize).toBe(byArithmetic.totalSize);
		}
	});
});

describe('createVirtual — measured layout', () => {
	it('leaves the uniform path and reflects the measured size downstream', () => {
		const model = createVirtualLayout(new Source(100).backing());
		model.measure(0, 50);

		expect(model.totalSize).toBe(50 + 99 * 10);
		expect(model.sizeOf(0)).toBe(50);
		expect(model.sizeOf(1)).toBe(10);
		expect(model.offsetOf(1)).toBe(50);
		expect(model.offsetOf(2)).toBe(60);
		expect(model.items[0]).toEqual({ index: 0, key: 'item-0', start: 0, size: 50 });
	});

	it('stores sizes by key, so a reorder carries each item its own size', () => {
		const source = new Source(3);
		const model = createVirtualLayout(source.backing());
		model.measure(0, 30);
		expect(model.totalSize).toBe(50);

		// 'item-0' moves to the end; its 30 must move with it.
		source.keys = ['item-1', 'item-2', 'item-0'];
		expect(model.offsetOf(0)).toBe(0);
		expect(model.offsetOf(1)).toBe(10);
		expect(model.offsetOf(2)).toBe(20);
		expect(model.items[2]).toEqual({ index: 2, key: 'item-0', start: 20, size: 30 });
		expect(model.totalSize).toBe(50);
	});

	// A reorder keeps every measurement, a replacement none — otherwise `sizes` is append-only, a map
	// keyed by every item ever measured, in exactly the case this rune exists for.
	it('drops the measurement of a key the source no longer has', () => {
		const source = new Source(3);
		const model = createVirtualLayout(source.backing());
		model.measure(0, 30);
		expect(model.totalSize).toBe(50);

		// Whole source replaced. Nothing measured survives, so every item is back on its estimate.
		source.keys = ['other-0', 'other-1', 'other-2'];
		expect(model.totalSize).toBe(30);

		// And the dropped key must not resurrect if its item comes back.
		source.keys = ['item-0', 'item-1', 'item-2'];
		expect(model.totalSize).toBe(30);
	});

	it('rebuilds only from the lowest dirty index', () => {
		let estimateReads = 0;
		const source = new Source(500);
		const model = createVirtualLayout(
			source.backing({
				estimateSize: () => {
					estimateReads += 1;
					return 10;
				}
			})
		);

		// A per-index estimator means the prefix-sum path from the first read.
		void model.totalSize;
		expect(estimateReads).toBe(500);

		model.measure(400, 25);
		void model.totalSize;

		// Indices 401..499 re-read (400 itself is now measured); nothing below 400 is touched.
		expect(estimateReads).toBe(599);

		// A second read with nothing dirty rebuilds nothing at all.
		void model.totalSize;
		expect(estimateReads).toBe(599);
	});

	it('invalidates every index when the count changes', () => {
		const source = new Source(10);
		const model = createVirtualLayout(source.backing());
		model.measure(0, 40);
		expect(model.totalSize).toBe(40 + 9 * 10);

		source.keys = [...source.keys, 'item-10'];
		expect(model.totalSize).toBe(40 + 10 * 10);
	});

	it('drops an item that shrinks out of the source', () => {
		const source = new Source(10);
		const model = createVirtualLayout(source.backing());
		model.measure(9, 90);
		expect(model.totalSize).toBe(9 * 10 + 90);

		source.keys = source.keys.slice(0, 5);
		expect(model.totalSize).toBe(50);
		expect(model.range.last).toBe(4);
	});

	it('ignores a non-positive or non-finite measurement', () => {
		const model = createVirtualLayout(new Source(10).backing());
		model.measure(0, 0);
		model.measure(1, -5);
		model.measure(2, Number.NaN);
		model.measure(-1, 20);

		expect(model.totalSize).toBe(100);
		expect(model.sizeOf(0)).toBe(10);
	});

	it('windows a measured list by binary search', () => {
		const source = new Source(1000);
		const model = createVirtualLayout(source.backing());
		model.measure(0, 100); // forces the array path; the rest stay at 10

		source.scroll = 500;
		// Item 0 spans 0..100, then 10 each. Item 40 ends at 500, touching the scroll offset, so it
		// overlaps by nothing; 41 is first visible.
		expect(model.range.first).toBe(41);
		expect(model.items[0]).toEqual({ index: 41, key: 'item-41', start: 500, size: 10 });
	});
});
