import type { BondStateProps } from '$lib/kernel/types';

export interface StateChangeContext<B = never, E extends Event = Event> {
	event?: E;
	bond?: B;
	reason?: string;
}

export type StateChangeCallback<Value, B = never, E extends Event = Event> = (
	value: Value,
	context: StateChangeContext<B, E>
) => void;

/**
 * Remove keys `K` from `T`, surviving an index signature.
 *
 * `Omit` cannot do this over element props: `ElementProps extends Record<string, unknown>`, so
 * `keyof T` widens to `string | number`, `Exclude<…, K>` subtracts nothing, and `Pick` collapses
 * every named prop into the index signature — leaving each one typed `unknown`. A homomorphic
 * mapped type with an `as` clause drops the named keys while preserving the index signature and
 * every other property.
 */
export type OmitKey<T, K extends PropertyKey> = {
	[P in keyof T as P extends K ? never : P]: T[P];
};

// Override conflicting properties of T with U. Built on OmitKey, not Omit: with the stock Omit
// every property of T that U does not redeclare silently degraded to `unknown`.
export type Override<T, U> = OmitKey<T, keyof U> & U;

// Extracts the props type a family's shared object was parameterized with — every state class
// exposes `readonly props`, which is what a `factory` is handed.
type PropsOf<T> = T extends { readonly __props?: infer P }
	? P
	: T extends { readonly props: infer P }
		? P
		: BondStateProps;

// `T` is the family's shared object: a plain state class (`CardBond`, `AccordionBond`) the root
// builds and shares under its `Kernel.context`.
export type Factory<T> = (props: PropsOf<T>) => T;

// Sort direction.
export type Direction = 'asc' | 'desc';

// Column sort type — the field key used when sorting.
export type SortableType = string;
