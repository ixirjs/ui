// RovingFocus — "which item is highlighted": a moving active index with next/previous/first/last/goto.
// Distinct from SelectionModel (what's committed). Owns its own $state for the index;
// injects the item list via ids() (typically from a Collection).
export interface RovingFocus<T = unknown> {
	// Active index, or `-1` when nothing is highlighted.
	readonly activeIndex: number;
	// Active item id, or `null`.
	readonly activeId: string | null;
	// Active item object, or `null`. Resolved via RovingBacking.item; null when nothing active.
	readonly activeItem: T | null;
	// Move to the next item (wraps to first past the end, unless `wrap` is off).
	next(): string | null;
	// Move to the previous item (wraps to last before the start, unless `wrap` is off).
	previous(): string | null;
	first(): string | null;
	last(): string | null;
	// Highlight a specific id (`activeId` becomes `null` if the id is absent).
	goto(id: string): string | null;
	// Reset to nothing highlighted (`-1`).
	clear(): void;
}

// The item-list seam — the bond supplies its ordered ids (typically from a Collection).
export interface RovingBacking<T = unknown> {
	// Ordered item ids, e.g. `collection.entries.map(([id]) => id)`. Reactive.
	ids(): readonly string[];
	// Resolve an id to its item object (for RovingFocus.activeItem). Optional.
	item?(id: string): T | undefined;
	// Wrap past the ends. Default `true`.
	wrap?: boolean;
	// Controlled active id. Supply it when the highlight *is* some other state the bond already
	// owns — tabs highlight the selected tab, so an internal cell would immediately drift from
	// `props.value` on click. Omit it and the roving owns its own `$state`.
	active?: { get(): string | null; set(id: string | null): void };
}

// Build a RovingFocus over an injected ordered id list.
// Owns the active id; derives the index live so insertions/removals preserve identity when possible.
export function createRovingFocus<T = unknown>(backing: RovingBacking<T>): RovingFocus<T> {
	const wrap = backing.wrap ?? true;
	const own = $state<{ id: string | null }>({ id: null });
	const cell = backing.active ?? { get: () => own.id, set: (id) => (own.id = id) };

	const ids = (): readonly string[] => backing.ids();

	// The `item` role projection reads `activeId` once per rendered item, so a window of twenty items
	// costs twenty scans of the id list — invisible at twenty ids, not at the ten thousand a
	// virtualized list feeds from data. Memoising the last (list, id) pair collapses them to one
	// lookup; an `ids()` that allocates per call just misses and pays today's cost.
	//
	// Confirmed against the list, not merely keyed on its identity: a `$state` array is mutable in
	// place, so a push or reorder moves the contents while the identity holds. Re-reading the one
	// remembered slot is O(1) and settles it.
	let lastIds: readonly string[] | undefined;
	let lastId: string | null = null;
	let lastIndex = -1;
	const indexOfActive = (snapshot?: readonly string[]): number => {
		const id = cell.get();
		if (id === null) return -1;
		const current = snapshot ?? ids();
		if (current === lastIds && id === lastId && current[lastIndex] === id) return lastIndex;
		lastIds = current;
		lastId = id;
		lastIndex = current.indexOf(id);
		return lastIndex;
	};
	const activeId = (): string | null => (indexOfActive() < 0 ? null : cell.get());
	// Share only the pre-write list within a request. Always read back with a fresh list: a
	// controlled owner may reject/normalize the write or change membership synchronously.
	const set = (id: string | null): string | null => {
		cell.set(id);
		return activeId();
	};

	return {
		get activeIndex() {
			return indexOfActive();
		},
		get activeId() {
			return activeId();
		},
		get activeItem() {
			const id = activeId();
			return id !== null && backing.item ? (backing.item(id) ?? null) : null;
		},
		next() {
			const current = ids();
			const n = current.length;
			if (n === 0) return set(null);
			const index = indexOfActive(current);
			if (index < 0) return set(current[0] ?? null);
			const i = index + 1;
			return set(current[i >= n ? (wrap ? 0 : n - 1) : i] ?? null);
		},
		previous() {
			const current = ids();
			const n = current.length;
			if (n === 0) return set(null);
			const index = indexOfActive(current);
			if (index <= 0) return set(current[wrap ? n - 1 : 0] ?? null);
			return set(current[index - 1] ?? null);
		},
		first() {
			return set(ids()[0] ?? null);
		},
		last() {
			const current = ids();
			return set(current[current.length - 1] ?? null);
		},
		goto(id: string) {
			return set(ids().includes(id) ? id : null);
		},
		clear() {
			set(null);
		}
	};
}
