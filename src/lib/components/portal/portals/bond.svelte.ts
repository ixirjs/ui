import type { Snippet } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { PortalBond } from '../bond.svelte';
import type { Factory } from '$svelte-atoms/core/types';
import { Bond, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PortalsStateProps = BondStateProps & {
	id: string;
};

export type PortalsProps = {
	id: string;
	factory?: Factory<PortalsBond>;
	children?: Snippet<[{ portals: PortalsBond }]>;
};

// The single portal registry for a tree — every portal registers here, all consumers resolve from it.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class PortalsBondBase extends Bond<PortalsStateProps> {
	#portals = new SvelteMap<string, PortalBond>();

	constructor(props: PortalsStateProps, name = 'portals') {
		super(props, name);
	}

	get id() {
		return this.props.id;
	}

	getPortal(id: string): PortalBond | undefined {
		return this.#portals.get(id);
	}

	setPortal(id: string, portal: PortalBond) {
		this.#portals.set(id, portal);
	}

	deletePortal(id: string) {
		this.#portals.delete(id);
	}

	// set/delete as a lifecycle pair: returns an unregister thunk that only deletes if the entry is
	// still this portal, so a same-id remount isn't clobbered by a stale unregister.
	registerPortal(id: string, portal: PortalBond): () => void {
		this.#portals.set(id, portal);
		return () => {
			if (this.#portals.get(id) === portal) this.#portals.delete(id);
		};
	}
}

// Context-only registry bond (no atoms); the portal map lives on PortalsBondBase.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const PortalsBondImpl = defineBond<
	Record<never, never>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof PortalsBondBase
>({
	name: 'portals',
	base: PortalsBondBase,
	atoms: {}
});

export type PortalsBond = BondOf<typeof PortalsBondImpl>;

interface PortalsBondConstructor {
	new (props: PortalsStateProps): PortalsBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof PortalsBondImpl)['spec'];
	get(): PortalsBond | undefined;
	getOrThrow(message?: string): PortalsBond;
	set(bond: PortalsBond): PortalsBond;
	create(props: PortalsStateProps): PortalsBond;
}

export const PortalsBond = PortalsBondImpl as unknown as PortalsBondConstructor;
