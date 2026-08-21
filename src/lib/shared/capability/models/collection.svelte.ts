import {
	defineCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability/capability';
import { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';

// Parametric slot key per kind — Symbol.for so repeated calls (and duplicate library copies) resolve
// to one key by identity, preserving find/last-wins semantics across the family.
// A collection kind has one runtime owner per Bond. Keep its public slot surface untyped: a
// generic `T` here would let the same Symbol.for identity masquerade as incompatible collections.
//
// Memoized per kind because this is not a definition-time call: `CapabilityRegistry.collection(kind)`
// resolves the slot on every invocation — twice, counting `collectionCapability` — and the family
// getters that reach it (`get rows()`, `get children()`) are uncached, so a datagrid row or tree node
// re-derives the same key on every read. Each miss built a template string, re-ran the owner/name/
// version validation and hit the global symbol registry to arrive at a value fixed by `kind`. Kinds
// come from a tiny closed vocabulary ('row', 'column', 'child', 'item'), so this Map is bounded by
// the library's own authoring surface, not by anything a consumer can grow.
// Module-lifetime key cache, never reactive state.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const slotsByKind = new Map<string, CapabilityKey<Collection<unknown>>>();

export const collectionSlot = (kind: string): CapabilityKey<Collection<unknown>> => {
	const cached = slotsByKind.get(kind);
	if (cached !== undefined) return cached;
	const slot = sharedCapabilityKey<Collection<unknown>>(`@ixirjs/cap:collection:${kind}`);
	slotsByKind.set(kind, slot);
	return slot;
};

// A Capability whose surface is guaranteed present (the collection).
export type CollectionCapability<T> = Capability<Collection<T>> & {
	readonly surface: Collection<T>;
};

// Children registry as a first-class Capability (collection:<kind>), alongside selection/roving. Cached per slot (last-wins).
export function collectionCapability<T>(kind: string): CollectionCapability<T> {
	const collection = new Collection<T>(kind);

	return defineCapability<Collection<T>>({
		slot: collectionSlot(kind) as CapabilityKey<Collection<T>>,
		surface: collection,
		meta: {
			docs: 'Ordered child/item registry model.'
		}
	}) as CollectionCapability<T>;
}
