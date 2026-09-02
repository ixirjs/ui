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
import { createCn } from 'cn/config';

/**
 * The merge engine treats the axis shorthands as conflicting only with their PHYSICAL siblings:
 * `px-2` clears `pr-*`/`pl-*` but not `ps-*`/`pe-*`. A preset written in logical properties
 * (`ps-2 pe-7`) therefore survives a consumer's `px-2`, and since Tailwind emits `.pe-*` after
 * `.px-*`, the preset wins in the cascade — the consumer's class lands on the element and does
 * nothing. Teach the shorthands their logical siblings so the last-writer rule holds.
 */
export const cn = createCn({
	extend: {
		conflictingClassGroups: {
			px: ['pr', 'pl', 'ps', 'pe'],
			py: ['pt', 'pb', 'pbs', 'pbe'],
			mx: ['mr', 'ml', 'ms', 'me'],
			my: ['mt', 'mb', 'mbs', 'mbe'],
			'scroll-px': ['scroll-pr', 'scroll-pl', 'scroll-ps', 'scroll-pe'],
			'scroll-py': ['scroll-pt', 'scroll-pb', 'scroll-pbs', 'scroll-pbe'],
			'scroll-mx': ['scroll-mr', 'scroll-ml', 'scroll-ms', 'scroll-me'],
			'scroll-my': ['scroll-mt', 'scroll-mb', 'scroll-mbs', 'scroll-mbe'],
			'border-w-x': ['border-w-r', 'border-w-l', 'border-w-s', 'border-w-e'],
			'border-w-y': ['border-w-t', 'border-w-b', 'border-w-bs', 'border-w-be'],
			'border-color-x': ['border-color-r', 'border-color-l', 'border-color-s', 'border-color-e'],
			'border-color-y': ['border-color-t', 'border-color-b', 'border-color-bs', 'border-color-be']
		}
	}
});

export type ClassValueFunction = <T = unknown>(bond: T, ...args: unknown[]) => SvelteClassValue;
export type ClassValue = SvelteClassValue | ClassValueFunction | undefined;

export type Cn = SvelteClassValue | undefined | false;

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
