// Fallback identity for objects built outside a component scope (tests, programmatic use).
// A rendered family seeds from `$props.id()`, which is SSR-deterministic and survives hydration;
// this counter only fills the gap where no component scope exists. Never render its output as a
// bare DOM id — element ids derive from the seed through `Kernel.id`.
let identityCounter = 0;

export function generateId(prefix = 'ix'): string {
	return `${prefix}${++identityCounter}`;
}
