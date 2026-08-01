import { bondContextKey, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import type { Component } from 'svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type RootStateProps<T extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		renderers?: {
			readonly html?: Component;
			readonly svg?: Component;
			readonly mathml?: Component;
		};
		extend: T;
	};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class RootBond extends Bond<RootStateProps> {
	static CONTEXT_KEY = bondContextKey('root');

	constructor(props: RootStateProps) {
		super(props);
	}

	get rootElement() {
		return this.elements.root as HTMLElement | undefined;
	}
	set rootElement(el: HTMLElement | undefined) {
		this.elements.root = el;
	}
}
