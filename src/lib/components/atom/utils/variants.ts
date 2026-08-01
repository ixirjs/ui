import type { Bond } from '$svelte-atoms/core/shared';
import { type ClassValue, type VariantDefinition, VARIANT_DEF_TAG } from '$svelte-atoms/core/utils';
import {
	type ResolvedProps,
	getDefCacheMap,
	getCachedOwnKeys,
	getCompoundConditionKeys,
	hasOwnKeysCached,
	lruGet,
	lruSet,
	MAX_CACHE_SIZE
} from './cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVariantDefinition = VariantDefinition<any>;

// Returns the effective value for `key` under defaults-then-props: own props key wins
// (even undefined), avoids a `{ ...defaults, ...props }` spread on every call.
function effectivePropValue(
	props: Record<string, unknown>,
	defaults: Record<string, unknown> | undefined,
	key: string
): unknown {
	if (Object.hasOwn(props, key)) return props[key];
	if (defaults !== undefined && Object.hasOwn(defaults, key)) return defaults[key];
	return undefined;
}

// Builds a compact cache key from variant-relevant props; serializes primitives inline,
// falls back to JSON.stringify only for rare object values.
function buildVariantKey(
	variantKeys: readonly string[],
	props: Record<string, unknown>,
	defaults: Record<string, unknown> | undefined
): string {
	let key = '';
	for (const k of variantKeys) {
		// Absent from both layers → no segment; present-but-undefined → 'u'.
		let v: unknown;
		if (Object.hasOwn(props, k)) v = props[k];
		else if (defaults !== undefined && Object.hasOwn(defaults, k)) v = defaults[k];
		else continue;
		// Discriminate type so e.g. `"true"` and `true` don't collide.
		const t = typeof v;
		if (v === undefined) {
			key += k + '=u|';
		} else if (v === null) {
			key += k + '=n|';
		} else if (t === 'string' || t === 'number' || t === 'boolean') {
			key += k + '=' + t[0] + ':' + (v as string | number | boolean) + '|';
		} else {
			key += k + '=o:' + JSON.stringify(v) + '|';
		}
	}
	return key;
}

// Resolves a VariantDefinition to a ResolvedProps object, cached per-(def, bond, props key)
// so repeated renders with the same inputs return the same reference.
export function resolveVariants(
	def: AnyVariantDefinition,
	bond: Bond | null | undefined,
	props: Record<string, unknown>
): ResolvedProps {
	const { variants: variantMap, compounds, defaults, class: baseClass } = def;

	// Defaults participate via `effectivePropValue` (props-then-defaults reads)
	// instead of a `{ ...defaults, ...props }` spread — the spread allocated on
	// every call, including cache hits.
	const effectiveDefaults = hasOwnKeysCached(defaults)
		? (defaults as Record<string, unknown>)
		: undefined;
	const variantKeys = getCachedOwnKeys(variantMap as object | undefined);

	// Fast path: no variants or compounds — cached per `def` reference so
	// repeated renders return the SAME object (preserves downstream identity).
	if (variantKeys.length === 0 && !compounds?.length) {
		const fastMap = getDefCacheMap(def as unknown as object, bond);
		const fastHit = lruGet(fastMap, '');
		if (fastHit !== undefined) return fastHit;
		const fastResult = { class: baseClass ? [baseClass] : [] } as ResolvedProps;
		lruSet(fastMap, '', fastResult, MAX_CACHE_SIZE);
		return fastResult;
	}

	const cacheKey = buildVariantKey(variantKeys, props, effectiveDefaults);
	const cacheMap = getDefCacheMap(def as unknown as object, bond);
	const hit = lruGet(cacheMap, cacheKey);
	if (hit !== undefined) return hit;

	const classes: ClassValue[] = [];
	const attributes: Record<string | symbol, unknown> = {};

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
				if ('class' in resolved) classes.push(resolved.class);
				const syms = Object.getOwnPropertySymbols(resolved);
				if (syms.length) {
					const src = resolved as Record<string | symbol, unknown>;
					for (const sym of syms) attributes[sym] = src[sym];
				}
			}
		}
	}

	if (compounds?.length) {
		for (const compound of compounds) {
			const compoundClass = compound.class;
			const conditionKeys = getCompoundConditionKeys(compound);
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

	const result = { class: classes, ...attributes };
	lruSet(cacheMap, cacheKey, result, MAX_CACHE_SIZE);
	return result;
}

// Cache constructed preset variant defs by `presetVariants` reference for downstream cache hits.
const presetDefCache = new WeakMap<object, AnyVariantDefinition>();

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
	if (cached) return cached;
	const built = {
		class: presetClass ?? '',
		variants: presetVariants,
		compounds: presetCompounds ?? [],
		defaults: presetDefaults ?? {}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any as AnyVariantDefinition;
	presetDefCache.set(presetVariants, built);
	return built;
}

// Merge cache keyed by (presetResolved, localVariants) reference pair — both inputs are
// reference-stable across renders, so the same merged object is returned without re-allocating.
const mergeCache = new WeakMap<object, WeakMap<object, ResolvedProps>>();

function getCachedMerge(
	presetResolved: ResolvedProps,
	localVariants: ResolvedProps
): ResolvedProps | undefined {
	const inner = mergeCache.get(presetResolved as unknown as object);
	return inner?.get(localVariants as unknown as object);
}

function setCachedMerge(
	presetResolved: ResolvedProps,
	localVariants: ResolvedProps,
	merged: ResolvedProps
): void {
	let inner = mergeCache.get(presetResolved as unknown as object);
	if (!inner) {
		inner = new WeakMap();
		mergeCache.set(presetResolved as unknown as object, inner);
	}
	inner.set(localVariants as unknown as object, merged);
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

	const cachedMerge = getCachedMerge(presetResolved, local);
	if (cachedMerge !== undefined) return cachedMerge;

	const presetClasses = Array.isArray(presetResolved.class)
		? presetResolved.class
		: [presetResolved.class];
	const localClasses = Array.isArray(local.class) ? local.class : [local.class];

	const merged: ResolvedProps = {
		...presetResolved,
		...local,
		class: [...presetClasses, ...localClasses].filter(Boolean)
	};
	setCachedMerge(presetResolved, local, merged);
	return merged;
}

// Per-(fn, bond) cache for plain-function variants: memoizes last (snapshot, result) so
// re-renders with equivalent primitive props return the same ResolvedProps reference.
type PlainFnCacheEntry = { snapshot: string; result: ResolvedProps };

const plainFnCacheBond = new WeakMap<object, WeakMap<object, PlainFnCacheEntry>>();
const plainFnCacheNoBond = new WeakMap<object, PlainFnCacheEntry>();

function getPlainFnEntry(fn: object, bond: Bond | null | undefined): PlainFnCacheEntry | undefined {
	if (!bond) return plainFnCacheNoBond.get(fn);
	const inner = plainFnCacheBond.get(fn);
	return inner?.get(bond as unknown as object);
}

function setPlainFnEntry(
	fn: object,
	bond: Bond | null | undefined,
	entry: PlainFnCacheEntry
): void {
	if (!bond) {
		plainFnCacheNoBond.set(fn, entry);
		return;
	}
	let inner = plainFnCacheBond.get(fn);
	if (!inner) {
		inner = new WeakMap();
		plainFnCacheBond.set(fn, inner);
	}
	inner.set(bond as unknown as object, entry);
}

function snapshotPrimitiveProps(props: Record<string, unknown>): string | null {
	let s = '';
	// Insertion order, unsorted: a component instance's rest-props keys keep a
	// stable order across re-renders, which is all the snapshot comparison
	// needs. A differently-ordered (but equal) props object would only cause a
	// spurious cache miss — recompute, not corruption — so sorting bought
	// nothing but a per-render allocation + O(n log n).
	const keys = Object.keys(props);
	for (const k of keys) {
		const v = props[k];
		const t = typeof v;
		if (v === null) {
			s += k + '=n|';
		} else if (t === 'string' || t === 'number' || t === 'boolean' || t === 'undefined') {
			s += k + '=' + (t === 'undefined' ? 'u' : t[0]) + ':' + String(v) + '|';
		} else {
			// Non-primitive value: cannot safely structural-compare — bail out.
			return null;
		}
	}
	return s;
}

// Resolves locally-supplied `variants` to a ResolvedProps object.
// Handles VARIANT_DEF_TAG functions, plain functions (snapshot-cached), and raw VariantDefinition objects.
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

	if (typeof variants === 'function') {
		const snapshot = snapshotPrimitiveProps(props);
		if (snapshot !== null) {
			const cached = getPlainFnEntry(variants, bond);
			if (cached && cached.snapshot === snapshot) return cached.result;
			const result = variants(bond, props);
			setPlainFnEntry(variants, bond, { snapshot, result });
			return result;
		}
		return variants(bond, props);
	}

	return resolveVariants(variants, bond, props);
}
