import type { Bond } from './bond.svelte';

// Single source of truth for the default `factory` of a root component.
// Special factories (generics, `.share()`, multi-step assembly) stay bespoke.
export function bondFactory<P, S, B extends Bond>(
	_StateClass: new (props: P) => S,
	BondClass: new (props: P) => B
): (props: P) => B {
	return (props) => new BondClass(props);
}
