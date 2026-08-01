import type { Behavior, Capability } from '../bond.svelte';
import { Collection } from '../collection.svelte';

// Slot prefix for collections; collection('item') registers at slot 'collection:item'.
const COLLECTION_SLOT_PREFIX = 'collection:';

export const collectionSlot = (kind: string): string => `${COLLECTION_SLOT_PREFIX}${kind}`;

export interface CollectionProjectionOptions {
	// Opt into positional ARIA: item role → aria-posinset/setsize/data-index; container role → aria-setsize.
	// Default false (surface-only, no emitted attrs). Enable per component once id↔role-ctx contract is verified.
	positional?: boolean;
}

// A Capability whose surface is guaranteed present (the collection).
export type CollectionCapability<T> = Capability<Collection<T>> & {
	readonly surface: Collection<T>;
};

// Children registry as a first-class Capability (collection:<kind>); lives in the same #capabilities home as selection/roving.
// Collection is created here and cached per slot (last-wins-per-slot).
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
					// aria-* are 1-based; data-index is 0-based CSS hook; both omitted until id is registered.
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
