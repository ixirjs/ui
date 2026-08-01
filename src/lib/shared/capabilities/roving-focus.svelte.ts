import { sharedCapabilityKey, type Behavior, type Capability } from '../bond.svelte';

// Public slot key — surface type travels with the key, so `capability(ROVING)` is typed (no cast).
export const ROVING = sharedCapabilityKey<RovingFocus>('@svelte-atoms/cap:roving');

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
}

// Build a RovingFocus over an injected ordered id list.
// Owns its own reactive active index; reads the list live so it tracks insertions/removals.
export function createRovingFocus<T = unknown>(backing: RovingBacking<T>): RovingFocus<T> {
	const wrap = backing.wrap ?? true;
	let index = $state(-1);

	const ids = (): readonly string[] => backing.ids();
	const idAt = (i: number): string | null => ids()[i] ?? null;
	const set = (i: number): string | null => {
		index = i;
		return idAt(i);
	};

	return {
		get activeIndex() {
			return index;
		},
		get activeId() {
			return idAt(index);
		},
		get activeItem() {
			const id = idAt(index);
			return id !== null && backing.item ? (backing.item(id) ?? null) : null;
		},
		next() {
			const n = ids().length;
			if (n === 0) return set(-1);
			if (index < 0) return set(0);
			const i = index + 1;
			return set(i >= n ? (wrap ? 0 : n - 1) : i);
		},
		previous() {
			const n = ids().length;
			if (n === 0) return set(-1);
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
			return set(ids().indexOf(id)); // -1 when absent → activeId null
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
	return {
		slot: ROVING,
		surface: roving,
		behavior(role, ctx): Behavior | undefined {
			if (role === 'container') {
				return {
					attrs: () => {
						const active = roving.activeId;
						return {
							'aria-activedescendant': active === null ? undefined : toDomId(active),
							...(options.orientation ? { 'aria-orientation': options.orientation } : {})
						};
					}
				};
			}
			if (role === 'item') {
				const id = ctx as string;
				return {
					// boolean (true/false) — the keyboard-navigation styling hook (`[data-highlighted="true"]`)
					attrs: () => ({ 'data-highlighted': roving.activeId === id })
				};
			}
			return undefined;
		}
	};
}
