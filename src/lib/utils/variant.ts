// defineVariants: single-function variant system with bond state access, type safety, and attribute support.

import type { ClassValue } from 'svelte/elements';
import type { Bond } from '$svelte-atoms/core/shared';

// Tags functions returned by defineVariants so resolveLocalVariants can route through the cached engine.
export const VARIANT_DEF_TAG = Symbol('svelte-atoms/variant-def');

export type TaggedVariantFn<V extends Record<string, Record<string, any>>> = ((
	bond: Bond,
	props?: VariantProps<V>
) => Record<string, any>) & {
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
// Returns a tagged function (bond, props?) => { class, ...attrs }.
export function defineVariants<V extends Record<string, Record<string, any>>>(
	config: VariantDefinition<V> | ((bond?: Bond | null) => VariantDefinition<V>)
): TaggedVariantFn<V> {
	const fn = (bond: Bond, props?: VariantProps<V>): Record<string, any> => {
		const resolvedConfig = typeof config === 'function' ? config(bond) : config;
		const finalProps = { ...resolvedConfig.defaults, ...props };
		const classes: ClassValue[] = [];
		const attributes: Record<string, any> = {};

		if (resolvedConfig.class) classes.push(resolvedConfig.class);

		for (const [key, value] of Object.entries(finalProps)) {
			const variantValue = resolvedConfig.variants?.[key]?.[value as string];

			if (variantValue !== undefined) {
				const resolved = typeof variantValue === 'function' ? variantValue(bond) : variantValue;

				if (typeof resolved === 'string') {
					classes.push(resolved);
				} else if (typeof resolved === 'object' && resolved !== null) {
					if ('class' in resolved) {
						classes.push(resolved.class);
					}
					Object.entries(resolved).forEach(([k, v]) => {
						if (k !== 'class') {
							attributes[k] = v;
						}
					});
				}
			}
		}

		if (resolvedConfig.compounds) {
			for (const compound of resolvedConfig.compounds) {
				const { class: compoundClass, ...compoundProps } = compound;
				const matches = Object.entries(compoundProps).every(
					([key, value]) => finalProps[key] === value
				);
				if (matches) {
					if (compoundClass) classes.push(compoundClass);
					Object.entries(compound).forEach(([k, v]) => {
						if (k !== 'class' && !Object.keys(compoundProps).includes(k)) {
							attributes[k] = v;
						}
					});
				}
			}
		}

		return {
			class: classes,
			...attributes
		};
	};

	(fn as TaggedVariantFn<V>)[VARIANT_DEF_TAG] = config;

	return fn as TaggedVariantFn<V>;
}

export type ExtractVariants<T extends (...args: any[]) => any> = Parameters<T>[0];

export type VariantPropsType<T> =
	T extends VariantDefinition<infer V> ? VariantProps<V> : Record<string, any>;
