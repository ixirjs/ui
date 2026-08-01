import type { VirtualElement } from '@floating-ui/dom';
import type { Bond } from './bond.svelte';
import type { Atom } from './atom.svelte';
import type { PresetLike } from '$ixirjs/ui/preset/types';

export type BondVirtualElement = VirtualElement;

/** Per-slot presentation layers supplied by a Bond-owning root. */
export type BondPresetLayers = Readonly<Record<string, PresetLike | undefined>>;

export type BondStateProps = {
	id?: string;
	/** Root-owned, per-slot presentation layers shared by descendant Atoms. */
	presets?: BondPresetLayers | undefined;
};
export type BondElements = Record<string, Element | BondVirtualElement | undefined>;

// Types the polymorphic static get/set.
export type BondClass<T extends Bond> = { prototype: T; CONTEXT_KEY: string };

export type NodeCardinality = 'single' | 'many';

export type NodeRegistrationOptions = {
	key?: string;
	cardinality?: NodeCardinality;
};

export type NodeRegistration<N extends Atom = Atom> = {
	id: string;
	key: string;
	cardinality: NodeCardinality;
	node: N;
};

/** Deliberate public view; registration and lifecycle administration stay internal-ready. */
export type BondHandle = Pick<
	Bond,
	| 'id'
	| 'name'
	| 'namespace'
	| 'preset'
	| 'nodeByPart'
	| 'nodesByPart'
	| 'nodeByRole'
	| 'surface'
	| 'requireSurface'
>;

/** Deliberate public view of a rendered part. */
export type AtomHandle<E extends Element | BondVirtualElement = Element | BondVirtualElement> =
	Pick<Atom<Bond, E>, 'id' | 'name' | 'kind' | 'preset' | 'element' | 'spread' | 'hasRole'>;
