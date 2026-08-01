import type { Bond } from '$svelte-atoms/core/shared';

export type ResolvedProps = Record<string, unknown>;

// Two-level cache for resolved variants (legacy/public API): WeakMap<bond, Map<key, result>>.
// Exported for backward compat; internal callers prefer `getDefCacheMap`.
const variantCacheByBond = new WeakMap<object, Map<string, ResolvedProps>>();
const variantCacheNoBond = new Map<string, ResolvedProps>();

export const MAX_CACHE_SIZE = 100;

export function getCacheMap(bond: Bond | null | undefined): Map<string, ResolvedProps> {
	if (!bond) return variantCacheNoBond;
	let map = variantCacheByBond.get(bond);
	if (!map) {
		map = new Map();
		variantCacheByBond.set(bond, map);
	}
	return map;
}

// Per-(def, bond) cache: isolates eviction windows per atom, avoids cross-component thrash.
// Both keys are WeakMap-held so entries are GC'd when either becomes unreachable.
const defCacheBondMap = new WeakMap<object, WeakMap<object, Map<string, ResolvedProps>>>();
const defCacheNoBondMap = new WeakMap<object, Map<string, ResolvedProps>>();

export function getDefCacheMap(
	def: object,
	bond: Bond | null | undefined
): Map<string, ResolvedProps> {
	if (!bond) {
		let m = defCacheNoBondMap.get(def);
		if (!m) {
			m = new Map();
			defCacheNoBondMap.set(def, m);
		}
		return m;
	}
	const bondKey = bond as unknown as object;
	let inner = defCacheBondMap.get(bondKey);
	if (!inner) {
		inner = new WeakMap();
		defCacheBondMap.set(bondKey, inner);
	}
	let m = inner.get(def);
	if (!m) {
		m = new Map();
		inner.set(def, m);
	}
	return m;
}

// LRU lookup via delete+re-insert; recency tracking only kicks in at capacity
// (below capacity, touching is pure overhead — benchmarked 5–27x a plain Map.get).
export function lruGet<V>(
	map: Map<string, V>,
	key: string,
	max: number = MAX_CACHE_SIZE
): V | undefined {
	const v = map.get(key);
	if (v === undefined) return undefined;
	if (map.size >= max) {
		map.delete(key);
		map.set(key, v);
	}
	return v;
}

// Insert with LRU eviction when at capacity.
export function lruSet<V>(map: Map<string, V>, key: string, value: V, max: number): void {
	if (map.size >= max) {
		const firstKey = map.keys().next().value;
		if (firstKey !== undefined) map.delete(firstKey);
	}
	map.set(key, value);
}

// Cached Object.keys() keyed by object reference; variant maps are stable per definition.
const ownKeysCache = new WeakMap<object, string[]>();
const EMPTY_KEYS: readonly string[] = Object.freeze([]);

export function getCachedOwnKeys(obj: object | null | undefined): readonly string[] {
	if (!obj) return EMPTY_KEYS;
	let keys = ownKeysCache.get(obj);
	if (!keys) {
		keys = Object.keys(obj);
		ownKeysCache.set(obj, keys);
	}
	return keys;
}

// Cached Object.getOwnPropertySymbols() for stable presentation objects (preset, variants, fallbacks).
// Do NOT use for per-render-fresh objects like rest props — cache insert with no future hit.
const ownSymbolsCache = new WeakMap<object, readonly symbol[]>();

export function getCachedOwnSymbols(obj: object): readonly symbol[] {
	let syms = ownSymbolsCache.get(obj);
	if (!syms) {
		syms = Object.getOwnPropertySymbols(obj);
		ownSymbolsCache.set(obj, syms);
	}
	return syms;
}

// Returns true if `obj` has at least one own enumerable key.
export function hasOwnKeys(obj: object): boolean {
	for (const k in obj) if (Object.hasOwn(obj, k)) return true;
	return false;
}

// Cached `hasOwnKeys` keyed weakly; defaults objects are stable per definition.
const hasOwnKeysCache = new WeakMap<object, boolean>();

export function hasOwnKeysCached(obj: object | null | undefined): boolean {
	if (!obj) return false;
	const cached = hasOwnKeysCache.get(obj);
	if (cached !== undefined) return cached;
	const result = hasOwnKeys(obj);
	hasOwnKeysCache.set(obj, result);
	return result;
}

// Cached non-`class` condition keys for a compound variant; stable per definition, weakly keyed.
const compoundKeysCache = new WeakMap<object, string[]>();

export function getCompoundConditionKeys(compound: object): string[] {
	let keys = compoundKeysCache.get(compound);
	if (!keys) {
		keys = [];
		for (const k in compound) {
			if (Object.hasOwn(compound, k) && k !== 'class') keys.push(k);
		}
		compoundKeysCache.set(compound, keys);
	}
	return keys;
}
