import {
	bondContextKey,
	Bond,
	BondState,
	type BondStateProps
} from '$svelte-atoms/core/shared/bond.svelte';
import type { Component } from 'svelte';

export type RootStateProps<T extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		renderers?: {
			readonly html?: Component;
			readonly svg?: Component;
			readonly mathml?: Component;
		};
		extend: T;
	};

export class RootBond extends Bond<RootStateProps, RootBondState> {
	static CONTEXT_KEY = bondContextKey('root');

	constructor(atom: RootBondState) {
		super(atom);
	}

	get rootElement() {
		return this.elements.root as HTMLElement | undefined;
	}
	set rootElement(el: HTMLElement | undefined) {
		this.elements.root = el;
	}
}

export class RootBondState extends BondState<RootStateProps> {
	constructor(state: RootStateProps) {
		super(state);
	}
}
