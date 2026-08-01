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

// Override conflicting properties of T with U.
export type Override<T, U> = Omit<T, keyof U> & U;

// Partial override maintaining optional properties.
export type PartialOverride<T, U extends Partial<T>> = Omit<T, keyof U> & U;

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
