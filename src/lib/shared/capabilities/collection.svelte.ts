import { sharedCapabilityKey, type Behavior, type Capability, type CapabilityKey } from '../bond.svelte';
import { Collection } from '../collection.svelte';

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

	// Spread behavior only when positional — under exactOptionalPropertyTypes, absent key != undefined.
	return {
		slot: collectionSlot(kind),
		surface: collection,
		...(positional ? { behavior } : {})
	};

	function behavior(role: string, ctx?: unknown): Behavior | undefined {
		if (role === 'item') {
			const id = ctx as string;
			return {
				attrs: () => {
					const index = collection.indexOf(id);
					// aria-* 1-based, data-index 0-based; both omitted until the id registers.
					return {
						'aria-posinset': index < 0 ? undefined : index + 1,
						'aria-setsize': collection.size,
						'data-index': index < 0 ? undefined : index
					};
				}
			};
		}
		if (role === 'container') {
			return { attrs: () => ({ 'aria-setsize': collection.size }) };
		}
		return undefined;
	}
}
