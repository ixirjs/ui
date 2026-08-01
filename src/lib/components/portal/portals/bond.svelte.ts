import type { Snippet } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { PortalBond } from '../bond.svelte';
import type { Factory } from '$svelte-atoms/core/types';
import { BondState, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';

export type PortalsStateProps = BondStateProps & {
	id: string;
};

export type PortalsProps = {
	id: string;
	factory?: Factory<PortalsBond>;
	children?: Snippet<[{ portals: PortalsBond }]>;
};

// Context-only registry bond (no atoms); the portal map lives on PortalsState.
export const PortalsBond = defineBond<Record<never, never>, PortalsState>({
	name: 'portals',
	atoms: {}
});

export type PortalsBond = BondOf<typeof PortalsBond>;

// The single portal registry for a tree — every portal registers here, all consumers resolve from it.
export class PortalsState extends BondState<PortalsStateProps> {
	#portals = new SvelteMap<string, PortalBond>();

	get id() {
		return this.props.id;
	}

	get(id: string): PortalBond | undefined {
		return this.#portals.get(id);
	}

	set(id: string, portal: PortalBond) {
		this.#portals.set(id, portal);
	}

	delete(id: string) {
		this.#portals.delete(id);
	}

	// set/delete as a lifecycle pair: returns an unregister thunk that only deletes if the entry is
	// still this portal, so a same-id remount isn't clobbered by a stale unregister.
	register(id: string, portal: PortalBond): () => void {
		this.#portals.set(id, portal);
		return () => {
			if (this.#portals.get(id) === portal) this.#portals.delete(id);
		};
	}
}
