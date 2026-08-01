import type { VirtualElement } from '@floating-ui/dom';
import type { Bond } from './bond.svelte';
import type { Atom } from './atom.svelte';

export type BondVirtualElement = VirtualElement;

export type BondStateProps = { id?: string };
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
