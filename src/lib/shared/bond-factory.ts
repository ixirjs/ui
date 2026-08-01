import type { Bond } from './bond.svelte';

// Single source of truth for the default `factory` of a root component: a bond is a Bond wrapping
// its BondState. Replaces the per-root `function defaultFactory(props) { return new XBond(new XState(props)); }`
// boilerplate. Special factories (generics, `.share()`, multi-step assembly) stay bespoke.
export function bondFactory<P, S, B extends Bond>(
	StateClass: new (props: P) => S,
	BondClass: new (state: S) => B
): (props: P) => B {
	return (props) => new BondClass(new StateClass(props));
}
