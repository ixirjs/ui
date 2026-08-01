// Symbol.for survives duplicate copies and HMR; forgeable by design, guards forks not adversaries.
export const BOND_BRAND: unique symbol = Symbol.for('@ixirjs/bond:brand');

// Fallback identity for Bonds/Atoms built outside a component scope (tests, programmatic use).
// Rendered parts seed from `$props.id()` via bindBond, which is SSR-deterministic and survives
// hydration; this counter only fills the gap where no component scope exists. Never rendered as a
// bare DOM id — Atoms derive element ids from it through getElementId.
let identityCounter = 0;

export function generateId(prefix = 'ix'): string {
	return `${prefix}${++identityCounter}`;
}

/**
 * Whether an owner's identity can change after construction.
 *
 * `bindBond` installs two different kinds of `id`, and the descriptor tells them apart:
 *
 * - The `$props.id()` seed every root passes is defined **non-enumerable**, precisely so it never
 *   reaches the DOM through `stateProps`. It is fixed for the component's lifetime.
 * - A root that declares an `id` cell in its props spec (DataGrid.Column binds one to a consumer
 *   prop) gets an **enumerable** accessor from `assembleProps`, and that value can change.
 *
 * Only the second needs its element ids recomputed on read; the first — the overwhelmingly common
 * case — keeps the constant computed once at construction.
 */
export function hasDynamicId(owner: { props?: object } | undefined): boolean {
	const props = owner?.props;
	if (!props) return false;
	const descriptor = Object.getOwnPropertyDescriptor(props, 'id');
	return typeof descriptor?.get === 'function' && descriptor.enumerable === true;
}

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
