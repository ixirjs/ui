import {
	defineCapability,
	defineProjectionCapability,
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
	sharedCapabilityKey<Collection<unknown>>({
		owner: '@ixirjs/cap',
		name: `collection:${kind}`,
		version: 1
	});

export interface CollectionProjectionOptions {
	// Opt into positional ARIA on items (posinset/setsize/data-index). Default false (surface-only).
	positional?: boolean;
}

// A Capability whose surface is guaranteed present (the collection).
export type CollectionCapability<T> = Capability<Collection<T>> & {
	readonly surface: Collection<T>;
};

// Children registry as a first-class Capability (collection:<kind>), alongside selection/roving. Cached per slot (last-wins).
export function collectionCapability<T>(
	kind: string,
	options: CollectionProjectionOptions = {}
): CollectionCapability<T> {
	const collection = new Collection<T>(kind);
	const positional = options.positional ?? false;

	// Positional ARIA is opt-in: without it the collection is a surface-only capability (no projection).
	if (!positional) {
		return defineCapability<Collection<T>>({
			slot: collectionSlot(kind) as CapabilityKey<Collection<T>>,
			surface: collection,
			meta: {
				docs: 'Ordered child/item registry model.'
			}
		}) as CollectionCapability<T>;
	}

	return defineProjectionCapability<Collection<T>>({
		slot: collectionSlot(kind) as CapabilityKey<Collection<T>>,
		surface: collection,
		meta: {
			docs: 'Ordered child/item registry model with optional positional ARIA projection.'
		},
		roles: {
			item: (id) => ({
				attrs: () => {
					const index = collection.indexOf(id as string);
					// aria-* 1-based, data-index 0-based; both omitted until the id registers.
					return {
						'aria-posinset': index < 0 ? undefined : index + 1,
						'aria-setsize': collection.size,
						'data-index': index < 0 ? undefined : index
					};
				}
			})
		}
	}) as CollectionCapability<T>;
}
