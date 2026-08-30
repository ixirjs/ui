export type ResolvedProps = Record<string, unknown>;

// Cached Object.getOwnPropertySymbols() for stable presentation objects (defaults, preset, variants).
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
