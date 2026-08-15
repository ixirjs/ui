import type { Bond, BondStateProps } from '$lib/shared/bond';

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

// Partial override maintaining optional properties.
export type PartialOverride<T, U extends Partial<T>> = OmitKey<T, keyof U> & U;

// Deep override for nested objects.
export type DeepOverride<T, U> = U extends object
	? T extends object
		? {
				[K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
			}
		: U
	: U;

// Extracts the props type a Bond was parameterized with; reads the bond first so props-owned
// defineBond bases resolve directly from the base class.
type PropsOf<T extends Bond> = T extends { readonly __props?: infer P }
	? P
	: T extends { readonly props: infer P }
		? P
		: T extends Bond<infer P>
			? P
			: BondStateProps;

export type Factory<T extends Bond> = (props: PropsOf<T>) => T;

// Sort direction.
export type Direction = 'asc' | 'desc';

// Column sort type — the field key used when sorting.
export type SortableType = string;
