import type { Bond } from '$ixirjs/ui/shared';
import { type ClassValue, type VariantDefinition, VARIANT_DEF_TAG } from '$ixirjs/ui/utils';
import type { Motion } from '$ixirjs/ui/preset';
import type { ResolvedProps } from './cache';
import { VARIANTS_SKIP } from './constants';
import { extractMotion, mergeMotionConfig } from './motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVariantDefinition = VariantDefinition<any>;

// Effective value for `key`: own props key wins (even undefined), else defaults — no spread.
function effectivePropValue(
	props: Record<string, unknown>,
	defaults: Record<string, unknown> | undefined,
	key: string
): unknown {
	if (Object.hasOwn(props, key)) return props[key];
	if (defaults !== undefined && Object.hasOwn(defaults, key)) return defaults[key];
	return undefined;
}

// Resolve on every tracked read. Variant maps and callbacks may themselves read reactive state;
// reference-keyed result caches would bypass those reads and return stale presentation.
export function resolveVariants(
	def: AnyVariantDefinition,
	bond: Bond | null | undefined,
	props: Record<string, unknown>
): ResolvedProps {
	const { variants: variantMap, compounds, defaults, class: baseClass } = def;

	const effectiveDefaults = defaults as Record<string, unknown> | undefined;
	const variantKeys = Object.keys(variantMap ?? {});

	const classes: ClassValue[] = [];
	const attributes: Record<string, unknown> = {};
	let motion: Motion | null | undefined;

	if (baseClass) classes.push(baseClass);

	if (variantMap) {
		for (const key of variantKeys) {
			const value = effectivePropValue(props, effectiveDefaults, key);
			if (value === undefined) continue;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const variantValue = (variantMap as any)[key]?.[value as string];
			if (variantValue === undefined) continue;

			const resolved = typeof variantValue === 'function' ? variantValue(bond) : variantValue;

			if (typeof resolved === 'string') {
				classes.push(resolved);
			} else if (typeof resolved === 'object' && resolved !== null) {
				const src = resolved as Record<string | symbol, unknown>;
				if ('class' in resolved) classes.push(src.class as ClassValue);
				motion = mergeMotionConfig(motion, extractMotion(src));
				// Variant values may publish ordinary DOM attrs as well as classes.
				for (const attr in resolved) {
					if (!Object.hasOwn(resolved, attr) || VARIANTS_SKIP.has(attr)) continue;
					attributes[attr] = src[attr];
				}
			}
		}
	}

	if (compounds?.length) {
		for (const compound of compounds) {
			const compoundClass = compound.class;
			const conditionKeys = Object.keys(compound).filter((key) => key !== 'class');
			let matches = true;
			for (const key of conditionKeys) {
				if (effectivePropValue(props, effectiveDefaults, key) !== compound[key]) {
					matches = false;
					break;
				}
			}
			if (!matches) continue;
			if (compoundClass) classes.push(compoundClass);
		}
	}

	return {
		class: classes,
		...(motion !== undefined ? { motion } : {}),
		...attributes
	};
}

type SelectorKeyCacheEntry = {
	compounds: ReadonlyArray<Record<string, unknown>> | undefined;
	keys: ReadonlySet<string>;
};

// Keyed on the `variants` map, NOT on the record that holds it. A preset record can be a fresh
// reference per resolve (entry factories may rebuild it), so caching on the record misses every
// time — measured at ~12% across every bonded layer when it did, since the miss allocates a Set
// per rendered part. The variants map inside the record is the reference that survives.
//
// `compounds` is validated as a sibling rather than keyed on, mirroring `presetDefCache`: a
// reactive entry can swap compounds while retaining the same map.
const selectorKeyCache = new WeakMap<object, SelectorKeyCacheEntry>();

/**
 * The prop names a variants definition reads as selectors.
 *
 * A selector is consumed presentation input, not DOM data: `<Button variant="primary">` picks a
 * class and must not also emit `variant="primary"` onto the element. The fold strips these from the
 * consumer layer only — preset and variant layers already have `PRESET_SKIP` / `VARIANTS_SKIP` —
 * so a prop the definition does not declare still reaches the element untouched.
 */
export function variantSelectorKeys(
	variantMap: Record<string, unknown> | undefined,
	compounds: ReadonlyArray<Record<string, unknown>> | undefined
): ReadonlySet<string> | undefined {
	// Nothing declares a selector, so nothing is consumed and the fold keeps its passthrough.
	const cacheKey = variantMap ?? compounds;
	if (!cacheKey) return undefined;

	const cached = selectorKeyCache.get(cacheKey);
	if (cached && cached.compounds === compounds) return cached.keys;

	const keys = new Set<string>();
	if (variantMap) for (const key in variantMap) keys.add(key);
	// Compounds match on props too, and may condition on a key no `variants` entry declares.
	if (compounds) {
		for (const compound of compounds) {
			for (const key in compound) if (key !== 'class') keys.add(key);
		}
	}

	selectorKeyCache.set(cacheKey, { compounds, keys });
	return keys;
}

type PresetDefCacheEntry = {
	class: ClassValue | undefined;
	compounds: Array<Record<string, unknown>> | undefined;
	defaults: Record<string, unknown> | undefined;
	definition: AnyVariantDefinition;
};

// A variants-map reference alone is not a complete cache key: reactive entries can change
// class/compounds/defaults while retaining that map. Validate every semantic sibling.
const presetDefCache = new WeakMap<object, PresetDefCacheEntry>();

function getOrBuildPresetDef(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	presetVariants: Record<string, any>,
	presetClass: ClassValue | undefined,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	presetCompounds: Array<Record<string, any>> | undefined,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	presetDefaults: Record<string, any> | undefined
): AnyVariantDefinition {
	const cached = presetDefCache.get(presetVariants);
	if (
		cached &&
		cached.class === presetClass &&
		cached.compounds === presetCompounds &&
		cached.defaults === presetDefaults
	) {
		return cached.definition;
	}
	const definition = {
		class: presetClass ?? '',
		variants: presetVariants,
		compounds: presetCompounds ?? [],
		defaults: presetDefaults ?? {}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any as AnyVariantDefinition;
	presetDefCache.set(presetVariants, {
		class: presetClass,
		compounds: presetCompounds,
		defaults: presetDefaults,
		definition
	});
	return definition;
}

// Merges preset variant defs with local resolved variants; local wins, classes concatenated preset-first.
export function mergeVariants(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	presetVariants: Record<string, any> | undefined,
	presetClass: ClassValue | undefined,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	presetCompounds: Array<Record<string, any>> | undefined,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	presetDefaults: Record<string, any> | undefined,
	localVariants: ResolvedProps | undefined,
	bond: Bond | null | undefined,
	props: Record<string, unknown>
): ResolvedProps | undefined {
	if (!presetVariants && !localVariants) return undefined;

	if (presetVariants && !localVariants) {
		const variantDef = getOrBuildPresetDef(
			presetVariants,
			presetClass,
			presetCompounds,
			presetDefaults
		);
		return resolveVariants(variantDef, bond, props);
	}

	if (!presetVariants && localVariants) return localVariants;

	const presetVariantDef = getOrBuildPresetDef(
		// `presetVariants` is non-null in this branch (TS narrowing lost via `&&`).
		presetVariants as Record<string, unknown>,
		presetClass,
		presetCompounds,
		presetDefaults
	);
	const presetResolved = resolveVariants(presetVariantDef, bond, props);
	// `localVariants` is guaranteed non-null in this branch.
	const local = localVariants as ResolvedProps;

	const presetClasses = Array.isArray(presetResolved.class)
		? presetResolved.class
		: [presetResolved.class];
	const localClasses = Array.isArray(local.class) ? local.class : [local.class];
	const motion = mergeMotionConfig(extractMotion(presetResolved), extractMotion(local));

	return {
		...presetResolved,
		...local,
		class: [...presetClasses, ...localClasses].filter(Boolean),
		...(motion !== undefined ? { motion } : {})
	};
}

// Resolve local definitions inside the caller's tracking scope; functions may read live bond state.
export function resolveLocalVariants(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	variants: any,
	bond: Bond | null | undefined,
	props: Record<string, unknown>
): ResolvedProps | undefined {
	if (!variants) return undefined;

	if (typeof variants === 'function' && VARIANT_DEF_TAG in variants) {
		const config = variants[VARIANT_DEF_TAG];
		const resolvedConfig = typeof config === 'function' ? config(bond) : config;
		return resolveVariants(resolvedConfig, bond, props);
	}

	if (typeof variants === 'function') return variants(bond, props);

	return resolveVariants(variants, bond, props);
}
