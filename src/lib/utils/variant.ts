// defineVariants: declares a variant definition and tags it so the atom resolver can find it.
//
// Resolution itself lives in `components/atom/resolve/variants.ts` — that copy owns motion
// extraction, VARIANTS_SKIP and the selector-key caches, and both call sites reach it by
// unwrapping VARIANT_DEF_TAG. This file therefore only tags; calling the returned function
// hands back the definition it carries, resolved against the bond.
//
// `any` is structural throughout this file: the variant-map generics
// (`Record<string, Record<string, any>>`) and merged-attribute records are
// permissive by design so every component's variant definition infers cleanly.
// Narrowing to `unknown` would break inference across the whole variant system.
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ClassValue } from 'svelte/elements';
import type { Bond } from '$ixirjs/ui/shared';

// Tags functions returned by defineVariants so resolveLocalVariants can route through the cached engine.
export const VARIANT_DEF_TAG = Symbol('ixirjs/variant-def');

export type TaggedVariantFn<V extends Record<string, Record<string, any>>> = ((
	bond?: Bond | null
) => VariantDefinition<V>) & {
	[VARIANT_DEF_TAG]: VariantDefinition<V> | ((bond?: Bond | null) => VariantDefinition<V>);
};

// Static value or a function that receives the bond.
export type VariantValue<T = any> = T | ((bond?: Bond | null) => T);

// Maps variant keys to their possible values; each value can return classes and/or attributes.
export type VariantDefinition<V extends Record<string, Record<string, any>>> = {
	// Base classes applied to all variants.
	class?: ClassValue;

	// Each key maps to its possible values.
	variants: V;

	// Applied when multiple variant conditions match simultaneously.
	compounds?: Array<
		Partial<{ [K in keyof V]: keyof V[K] }> & {
			class?: ClassValue;
			[key: string]: any;
		}
	>;

	// Default variant values.
	defaults?: Partial<{ [K in keyof V]: keyof V[K] }>;
};

// Props passed to the variant function.
export type VariantProps<V extends Record<string, Record<string, any>>> = Partial<{
	[K in keyof V]: keyof V[K];
}> & {
	bond?: Bond | null;
};

// Define variants for a component. Accepts a static config or a bond-receiving factory.
// Returns the definition tagged for the atom resolver; calling it yields the definition itself.
export function defineVariants<V extends Record<string, Record<string, any>>>(
	config: VariantDefinition<V> | ((bond?: Bond | null) => VariantDefinition<V>)
): TaggedVariantFn<V> {
	const fn = (bond?: Bond | null) => (typeof config === 'function' ? config(bond) : config);

	(fn as TaggedVariantFn<V>)[VARIANT_DEF_TAG] = config;

	return fn as TaggedVariantFn<V>;
}

export type ExtractVariants<T extends (...args: any[]) => any> = Parameters<T>[0];

export type VariantPropsType<T> =
	T extends VariantDefinition<infer V> ? VariantProps<V> : Record<string, any>;
