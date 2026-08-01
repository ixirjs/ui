// Symbol.for survives duplicate copies and HMR; forgeable by design, guards forks not adversaries.
export const BOND_BRAND: unique symbol = Symbol.for('@svelte-atoms/bond:brand');

// OrdinaryHasInstance: exact prototype semantics for subclass checks, bypassed only at base Bond.
export function ordinaryHasInstance(ctor: unknown, value: unknown): boolean {
	if (typeof ctor !== 'function') return false;
	const proto = (ctor as { prototype?: unknown }).prototype;
	if (proto === null || typeof proto !== 'object') return false;
	return (
		value !== null &&
		(typeof value === 'object' || typeof value === 'function') &&
		Object.prototype.isPrototypeOf.call(proto, value as object)
	);
}
