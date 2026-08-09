import {
	defineCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability/capability';

// Surface type travels with the key — capability(ROVING) is typed without a cast.
export const ROVING = sharedCapabilityKey<RovingFocus>('@ixirjs/cap:roving');

const rovingSlot = <T>(): CapabilityKey<RovingFocus<T>> => ROVING as CapabilityKey<RovingFocus<T>>;

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
	const idAt = (i: number): string | null => ids()[i] ?? null;

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
	const indexOfActive = (): number => {
		const id = cell.get();
		if (id === null) return -1;
		const current = ids();
		if (current === lastIds && id === lastId && current[lastIndex] === id) return lastIndex;
		lastIds = current;
		lastId = id;
		lastIndex = current.indexOf(id);
		return lastIndex;
	};
	const activeId = (): string | null => (indexOfActive() < 0 ? null : cell.get());
	// Reads back through the cell: a controlled owner may reject or normalize the write.
	const set = (i: number): string | null => {
		cell.set(idAt(i));
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
			const n = ids().length;
			if (n === 0) return set(-1);
			const index = indexOfActive();
			if (index < 0) return set(0);
			const i = index + 1;
			return set(i >= n ? (wrap ? 0 : n - 1) : i);
		},
		previous() {
			const n = ids().length;
			if (n === 0) return set(-1);
			const index = indexOfActive();
			if (index <= 0) return set(wrap ? n - 1 : 0);
			return set(index - 1);
		},
		first() {
			return set(ids().length ? 0 : -1);
		},
		last() {
			const n = ids().length;
			return set(n ? n - 1 : -1);
		},
		goto(id: string) {
			cell.set(ids().includes(id) ? id : null);
			return activeId();
		},
		clear() {
			set(-1);
		}
	};
}

// Options for `rovingCapability`'s container projection.
export interface RovingProjectionOptions {
	// Map an item id to its DOM element id for `aria-activedescendant`. Default identity.
	itemDomId?: (itemId: string) => string;
	// `aria-orientation` on the container.
	orientation?: 'horizontal' | 'vertical';
}

// Wrap a RovingFocus into a projectable Capability (slot 'roving').
// 'container' → aria-activedescendant + optional aria-orientation.
// 'item' (ctx = item id) → data-highlighted boolean (keyboard-navigation styling hook).
export function rovingCapability<T = unknown>(
	roving: RovingFocus<T>,
	options: RovingProjectionOptions = {}
): Capability<RovingFocus<T>> {
	const toDomId = options.itemDomId ?? ((id: string) => id);
	return defineCapability<RovingFocus<T>>({
		slot: rovingSlot<T>(),
		surface: roving,
		meta: {
			docs: 'Roving focus model surface with active-descendant and highlighted-item projections.'
		},
		roles: {
			container: () => ({
				attrs: () => {
					const active = roving.activeId;
					return {
						'aria-activedescendant': active === null ? undefined : toDomId(active),
						...(options.orientation ? { 'aria-orientation': options.orientation } : {})
					};
				}
			}),
			item: (id) => ({
				// boolean (true/false) — the keyboard-navigation styling hook (`[data-highlighted="true"]`)
				attrs: () => ({ 'data-highlighted': roving.activeId === id })
			})
		}
	});
}
