export { type StateDefiner, defineProperty, defineState } from './state';
export {
	defineVariants,
	VARIANT_DEF_TAG,
	type TaggedVariantFn,
	type VariantDefinition,
	type VariantProps,
	type VariantValue,
	type ExtractVariants,
	type VariantPropsType
} from './variant';
import type { ClassValue as SvelteClassValue } from 'svelte/elements';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ClassValueFunction = <T = unknown>(bond: T, ...args: unknown[]) => SvelteClassValue;
export type ClassValue = SvelteClassValue | ClassValueFunction | undefined;

export type Cn = SvelteClassValue | undefined | false;
export function cn(...inputs: Cn[]) {
	return twMerge(clsx(...inputs));
}

export function toClassValue(
	this: unknown,
	input: ClassValue | ClassValueFunction | undefined,
	...args: unknown[]
): SvelteClassValue {
	if (typeof input === 'function') {
		// Variadic cast: ClassValueFunction's required `bond` first param rejects a plain unknown[] apply.
		return (input as (...args: unknown[]) => SvelteClassValue).apply(this, args);
	}

	return input ?? '';
}
