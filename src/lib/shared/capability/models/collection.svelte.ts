import {
	defineModelCapability,
	defineProjectionCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityKey
} from '../capability';
import { Collection } from '../../bond/collection.svelte';

// Slot-key prefix for collections; collection('item') registers at slot key for 'collection:item'.
const COLLECTION_SLOT_PREFIX = '@svelte-atoms/cap:collection:';

// Parametric slot key per kind — Symbol.for so repeated calls (and duplicate library copies) resolve
// to one key by identity, preserving find/last-wins semantics across the family.
export const collectionSlot = (kind: string): CapabilityKey<Collection<unknown>> =>
	sharedCapabilityKey<Collection<unknown>>(`${COLLECTION_SLOT_PREFIX}${kind}`);

export interface CollectionProjectionOptions {
	// Opt into positional ARIA (item → posinset/setsize/data-index, container → setsize). Default false (surface-only).
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
		return defineModelCapability<Collection<T>>({
			slot: collectionSlot(kind),
			surface: collection,
			meta: {
				docs: 'Ordered child/item registry model.'
			}
		}) as CollectionCapability<T>;
	}

	return defineProjectionCapability<Collection<T>>({
		slot: collectionSlot(kind),
		surface: collection,
		meta: {
			docs: 'Ordered child/item registry model with optional positional ARIA projection.'
		},
		roles: {
			item: (id) => ({
				attrs: () => {
					const index = collection.indexOf(id);
					// aria-* 1-based, data-index 0-based; both omitted until the id registers.
					return {
						'aria-posinset': index < 0 ? undefined : index + 1,
						'aria-setsize': collection.size,
						'data-index': index < 0 ? undefined : index
					};
				}
			}),
			container: () => ({ attrs: () => ({ 'aria-setsize': collection.size }) })
		}
	}) as CollectionCapability<T>;
}
