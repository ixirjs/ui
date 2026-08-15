import type { ClassValue } from '$ixirjs/ui/utils';

/**
 * What a `List.Item` renders as, in one place.
 *
 * An authoring internal, deliberately NOT exported from `./index.ts`: it exists so a component that
 * used to *mount* `<List.Item>` can render the same element itself without the boundary, and a
 * consumer has no use for it. Keeping it off the barrel also keeps `select-item`/`dropdown-menu-item`
 * from importing the `List` atom namespace at all.
 */
export const LIST_ITEM_AS = 'li';

/**
 * The class array `List.Item` hands the element seam.
 *
 * `own` is the calling part's own item classes and lands between the shared base and the `$preset`
 * sentinel; `klass` stays last so the consumer wins. That is exactly where a wrapper's classes
 * landed when it mounted `<List.Item>`: the wrapper joined its own classes plus a `$preset` into one
 * string, which became `List.Item`'s `klass` — and since `mergeClassesWithPreset` places on the LAST
 * sentinel and strips every earlier one (`atom/resolve/classes.ts`), the wrapper's sentinel always
 * won and `List.Item`'s never did. Collapsing to a single sentinel here is the same placement.
 *
 * `own` may be an array or contain falsy entries; `clsx` drops them, so a caller can pass
 * `[isSelected && '…']` directly rather than pre-filtering.
 */
export function listItemClass(own: ClassValue, klass: ClassValue): ClassValue[] {
	return ['flex w-full gap-2 px-4 py-1', own, '$preset', klass];
}
