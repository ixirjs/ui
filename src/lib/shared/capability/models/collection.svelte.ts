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
export const collectionSlot = (kind: string): CapabilityKey<Collection<unknown>> =>
	sharedCapabilityKey<Collection<unknown>>(`@ixirjs/cap:collection:${kind}`);

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
