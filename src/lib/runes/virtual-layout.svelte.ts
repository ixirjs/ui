const DEFAULT_ESTIMATE = 40;
const DEFAULT_OVERSCAN = 4;

export interface VirtualBacking {
	/** Total item count, window or not. Reactive. */
	count(): number;
	/** Stable, unique key for an index. Sizes are stored by it, so a changed key drops its measurement. */
	keyAt(index: number): string | undefined;
	/**
	 * Size before measurement. A number means uniform and selects the O(1) layout; a function means
	 * variable estimates. Declare it as a getter to keep it reactive. Default 40.
	 */
	estimateSize?: number | ((index: number) => number) | undefined;
	/** Size of the scroll viewport along the scroll axis. */
	viewportSize(): number;
	/** Current scroll offset of the viewport. */
	scrollOffset(): number;
	/** Items rendered beyond each edge of the viewport. `undefined` takes the default of 4. */
	overscan?(): number | undefined;
	/** Index kept rendered outside the window, so `aria-activedescendant` resolves to a mounted element. */
	pinnedIndex?(): number | undefined;
	/**
	 * Identity token read on every layout — pass the items array. Any change rebuilds. Omit only when
	 * index → key never changes; a reorder keeping `count` is otherwise invisible.
	 */
	version?(): unknown;
}

export interface VirtualItem {
	index: number;
	key: string;
	/** Offset of this item's leading edge from the start of the scrollable content. */
	start: number;
	size: number;
}

export interface VirtualLayout {
	/** The rendered window, in index order, including overscan and the pinned item. */
	readonly items: readonly VirtualItem[];
	readonly range: { first: number; last: number };
	/** Size of the full scrollable content — what the spacer is sized to. */
	readonly totalSize: number;
	/** The retained index, echoed back so a follower does not need the backing too. */
	readonly pinnedIndex: number | undefined;
	/** Offset of an item's leading edge. Clamped to the source. */
	offsetOf(index: number): number;
	/** Measured size of an item, or its estimate. */
	sizeOf(index: number): number;
	/** Record a measured size. `index` bounds the incremental rebuild; the size is stored by key. */
	measure(index: number, size: number): void;
	/**
	 * Stop accepting measurements and drop any pending revision — a measurement landing after the
	 * host unmounts would write state nobody owns, from a frame callback nobody can cancel.
	 */
	dispose(): void;
}

/**
 * Windowed layout over an indexed source: what to render, where it sits, how tall the content is.
 * Pure — no DOM; `createVirtual` beside it wires it to elements. Split out because the arithmetic is
 * what is worth testing exhaustively, and it tests without a browser.
 *
 * Two paths. Uniform estimate with nothing measured: every answer is arithmetic and no array is
 * allocated at any list size — where a listbox of same-height options stays. Once something
 * measures: a prefix-sum array rebuilt lazily from the lowest dirty index, so a window of rows
 * mounting in one turn costs one bounded pass, not one full pass per row.
 */
export function createVirtualLayout(backing: VirtualBacking): VirtualLayout {
	// Key-addressed so a measurement survives reorder and is dropped when its key disappears.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a SvelteMap would publish per key; one coalesced revision is cheaper and is what every read depends on.
	const sizes = new Map<string, number>();
	let revision = $state(0);

	// One revision bump per turn: each item bumping on its own re-runs every layout read once per
	// item, the O(total)-per-row cost this model exists to remove.
	//
	// Next frame, not next microtask. Measurements arrive inside a ResizeObserver delivery, and a
	// microtask runs before that frame ends — the re-layout would resize observed elements in the
	// same cycle and the browser reports "ResizeObserver loop completed with undelivered
	// notifications" as a window `error` event with a null `error`. Falls back to a microtask off the
	// browser, where there are neither frames nor observers.
	const schedule: (run: () => void) => void =
		typeof requestAnimationFrame === 'function'
			? (run) => void requestAnimationFrame(run)
			: queueMicrotask;

	let bumpScheduled = false;
	let disposed = false;
	function bump(): void {
		if (bumpScheduled || disposed) return;
		bumpScheduled = true;
		schedule(() => {
			bumpScheduled = false;
			if (!disposed) revision += 1;
		});
	}

	// Prefix sums: offsets[i] is item i's start, offsets[count] the total. Plain fields, not `$state`
	// — every read goes through `revision`, which is what tracking hangs off.
	const offsets: number[] = [];
	let offsetsVersion: unknown;
	let offsetsCount = -1;
	let dirtyFrom = Infinity;

	function estimateAt(index: number): number {
		const estimate = backing.estimateSize;
		if (typeof estimate === 'function') return estimate(index);
		return estimate ?? DEFAULT_ESTIMATE;
	}

	/** The size every item shares, or `undefined` when the layout has to be computed per item. */
	function uniformSize(): number | undefined {
		void revision; // `sizes` is a plain Map; the revision is what makes reading its size reactive.
		if (sizes.size > 0) return undefined;
		const estimate = backing.estimateSize;
		if (typeof estimate === 'function') return undefined;
		const size = estimate ?? DEFAULT_ESTIMATE;
		return size > 0 ? size : undefined;
	}

	function sizeAt(index: number): number {
		const key = backing.keyAt(index);
		const measured = key === undefined ? undefined : sizes.get(key);
		return measured ?? estimateAt(index);
	}

	/**
	 * Drop measurements whose key left the source. Called only from the branch that already rebuilds
	 * every offset, so it adds an O(count) pass to an O(count) pass — and without it `sizes` is
	 * append-only, an unbounded map keyed by every item ever measured.
	 *
	 * Emptying `sizes` puts `uniformSize` back on the arithmetic path, which is safe: with nothing
	 * measured the prefix sums are the estimates, so both paths answer identically.
	 */
	function pruneSizes(count: number): void {
		if (sizes.size === 0) return;
		const live = new Set<string>();
		for (let index = 0; index < count; index++) {
			const key = backing.keyAt(index);
			if (key !== undefined) live.add(key);
		}
		for (const key of sizes.keys()) if (!live.has(key)) sizes.delete(key);
	}

	function ensureOffsets(count: number): number[] {
		void revision;
		const version = backing.version?.();
		// A different source or length invalidates every index, not just the tail.
		if (!Object.is(version, offsetsVersion) || count !== offsetsCount) {
			pruneSizes(count);
			offsetsVersion = version;
			offsetsCount = count;
			dirtyFrom = 0;
		}
		if (dirtyFrom === Infinity) return offsets;

		const from = Math.min(dirtyFrom, count);
		dirtyFrom = Infinity;
		offsets.length = count + 1;
		if (from === 0) offsets[0] = 0;
		for (let index = from; index < count; index++) {
			offsets[index + 1] = offsets[index]! + sizeAt(index);
		}
		return offsets;
	}

	/**
	 * Smallest index whose trailing edge passes `target`. `strict` because an item is visible when it
	 * *overlaps* the viewport: one ending exactly at the scroll offset is not, and neither is one
	 * starting exactly at the bottom edge — the same rule from either side.
	 */
	function boundary(prefix: number[], count: number, target: number, strict: boolean): number {
		let low = 0;
		let high = count;
		while (low < high) {
			const middle = (low + high) >>> 1;
			const edge = prefix[middle + 1]!;
			if (strict ? edge <= target : edge < target) low = middle + 1;
			else high = middle;
		}
		return Math.min(low, count - 1);
	}

	function bounds(): { count: number; first: number; last: number; uniform: number | undefined } {
		const count = backing.count();
		if (count <= 0) return { count: 0, first: 0, last: -1, uniform: undefined };

		const scroll = Math.max(0, backing.scrollOffset());
		const viewport = Math.max(0, backing.viewportSize());
		const overscan = Math.max(0, Math.trunc(backing.overscan?.() ?? DEFAULT_OVERSCAN));
		const end = scroll + viewport;
		const uniform = uniformSize();

		let first: number;
		let last: number;
		// Both paths must answer identically for identical geometry, or the window shifts by an item
		// the moment the first measurement lands. First visible is the smallest `i` whose end passes
		// `scroll`; last visible is the largest whose start falls short of `end`.
		if (uniform !== undefined) {
			first = Math.floor(scroll / uniform);
			last = Math.ceil(end / uniform) - 1;
		} else {
			const prefix = ensureOffsets(count);
			first = boundary(prefix, count, scroll, true);
			last = boundary(prefix, count, end, false);
		}

		// `first` clamps to the last index, not just to 0: an offset past the end (rubber-band scroll,
		// or a source that shrank while scrolled down) otherwise gives `first > last` and an empty
		// window instead of the final items. `boundary` self-clamps; the arithmetic path does not.
		return {
			count,
			first: Math.min(count - 1, Math.max(0, first - overscan)),
			last: Math.min(count - 1, Math.max(0, last + overscan)),
			uniform
		};
	}

	function itemAt(index: number, count: number, uniform: number | undefined): VirtualItem {
		const key = backing.keyAt(index) ?? String(index);
		if (uniform !== undefined) {
			return { index, key, start: index * uniform, size: uniform };
		}
		const prefix = ensureOffsets(count);
		return { index, key, start: prefix[index]!, size: prefix[index + 1]! - prefix[index]! };
	}

	const model: VirtualLayout = {
		get items() {
			const { count, first, last, uniform } = bounds();
			if (count === 0) return [];

			const items: VirtualItem[] = [];
			for (let index = first; index <= last; index++) items.push(itemAt(index, count, uniform));

			// Retained outside the window. Inserting at the correct end keeps index order without a sort.
			const pinned = backing.pinnedIndex?.();
			if (pinned !== undefined && pinned >= 0 && pinned < count) {
				if (pinned < first) items.unshift(itemAt(pinned, count, uniform));
				else if (pinned > last) items.push(itemAt(pinned, count, uniform));
			}
			return items;
		},
		get range() {
			const { first, last } = bounds();
			return { first, last };
		},
		get totalSize() {
			const count = backing.count();
			if (count <= 0) return 0;
			const uniform = uniformSize();
			return uniform !== undefined ? count * uniform : ensureOffsets(count)[count]!;
		},
		get pinnedIndex() {
			return backing.pinnedIndex?.();
		},
		offsetOf(index) {
			const count = backing.count();
			if (count <= 0) return 0;
			const clamped = Math.min(Math.max(0, Math.trunc(index)), count - 1);
			const uniform = uniformSize();
			return uniform !== undefined ? clamped * uniform : ensureOffsets(count)[clamped]!;
		},
		sizeOf(index) {
			const count = backing.count();
			if (count <= 0 || index < 0 || index >= count) return 0;
			const uniform = uniformSize();
			if (uniform !== undefined) return uniform;
			const prefix = ensureOffsets(count);
			return prefix[index + 1]! - prefix[index]!;
		},
		measure(index, size) {
			if (disposed || !Number.isFinite(size) || size <= 0 || index < 0) return;
			const key = backing.keyAt(index);
			if (key === undefined || Object.is(sizes.get(key), size)) return;
			sizes.set(key, size);
			dirtyFrom = Math.min(dirtyFrom, index);
			bump();
		},
		dispose() {
			disposed = true;
			sizes.clear();
		}
	};

	return model;
}
