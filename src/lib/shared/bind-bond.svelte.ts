import { untrack } from 'svelte';
import type { Bond, BondState, BondStateProps } from './bond.svelte';
import { defineProperty, defineState, type StateDefiner } from '../utils/state';
import type { PresetKey } from '../context/preset.svelte';

// Extracts the state-props type from a Bond; reads state first so defineBond bonds resolve, then falls back to Bond<P>.
type PropsOf<B extends Bond> = B extends { state: BondState<infer P> }
	? P
	: B extends Bond<infer P>
		? P
		: BondStateProps;

// Builds a bond from its assembled props cell object (the component's factory).
export type BondFactory<B extends Bond> = (props: PropsOf<B>) => B;

type Getter<V> = () => V;
type Setter<V> = (value: V) => void;

// Optional Object.defineProperty descriptor flags for a cell (rarely needed).
export type CellConfig = Pick<PropertyDescriptor, 'enumerable' | 'configurable'>;

// One reactive prop cell: () => V (read-only), [getter, setter] (read/write), or [getter, setter, CellConfig].
export type PropCell<V> = Getter<V> | [Getter<V>, Setter<V>] | [Getter<V>, Setter<V>, CellConfig];

// Per-field accessor spec for a bond's props: each field is a PropCell wired to $state/$bindable.
export type PropsSpec<P extends object> = {
	[K in keyof P]?: PropCell<P[K]>;
};

export type BondBindingOptions<B extends Bond = Bond> = {
	// Atom key to resolve (default: 'root').
	atomKey?: string;
	// Getter for the component's preset prop; wins over atom.preset when non-nullish.
	preset?: () => PresetKey | undefined;
	// Static defaults / restProps spread once into the props base. Reactive props belong in the props spec (see ADR 0002).
	base?: () => Partial<PropsOf<B>>;
};

// Fold a PropsSpec object into the defineProperty cell-definers it represents.
function specToDefiners<P extends object>(spec: PropsSpec<P>): StateDefiner<Partial<P>>[] {
	return Object.entries(spec)
		.filter(([, cell]) => cell != null)
		.map(([key, cell]) => {
			const [get, set, config] = (Array.isArray(cell) ? cell : [cell]) as [
				Getter<unknown>,
				Setter<unknown>?,
				CellConfig?
			];
			return defineProperty(key, get, set, config) as StateDefiner<Partial<P>>;
		});
}

// Root-component ritual: assembles props via PropsSpec and builds the bond in untrack.
// Caller shares it explicitly; spreading binding.atomProps + restProps gives preset→spread→rest precedence.
export class BondBinding<B extends Bond = Bond> {
	readonly bond: B;
	// The assembled reactive props cell object handed to the factory (the bond's live BondState props).
	readonly #props: PropsOf<B>;
	readonly #atomKey: string;
	readonly #presetGetter: (() => PresetKey | undefined) | undefined;

	constructor(
		factory: BondFactory<B>,
		props: PropsSpec<PropsOf<B>>,
		options?: BondBindingOptions<B>
	) {
		const assembled = defineState<PropsOf<B>>(specToDefiners(props), options?.base);
		this.#props = assembled;
		this.bond = untrack(() => factory(assembled));
		this.#atomKey = options?.atomKey ?? 'root';
		this.#presetGetter = options?.preset;
	}

	get preset() {
		return this.#presetGetter?.() ?? this.atom.preset;
	}

	get atom() {
		return this.bond.atom(this.#atomKey);
	}

	// Reactive props for the root element; merge restProps on top in the template.
	get props() {
		const preset = this.preset;
		return { preset, bond: this.bond, ...this.#props, ...this.atom.spread };
	}
}

// Factory shorthand for BondBinding.
export function bindBond<B extends Bond>(
	factory: BondFactory<B>,
	props: PropsSpec<PropsOf<B>>,
	options?: BondBindingOptions<B>
): BondBinding<B> {
	return new BondBinding(factory, props, options);
}
