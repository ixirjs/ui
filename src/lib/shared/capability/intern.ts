import { DEV } from 'esm-env';

/**
 * Interning for behaviour-only capability descriptors.
 *
 * A capability descriptor built by `defineCapability`/`defineAtomCapability` is a frozen value.
 * Where it carries no `surface`, it holds no state at all: its `behavior` callbacks receive the
 * node and bond as arguments and read everything through them. Two such descriptors built from
 * equal options are therefore interchangeable, and the host runtime keeps its own per-instance
 * state (`CapabilityRuntime` stores descriptors per host, never mutates them, and keys nothing by
 * descriptor identity). So one shared descriptor can serve every instance.
 *
 * That matters because these factories are called *per rendered part* — `ariaRole('icon')` runs
 * once for every Collapsible indicator on the page, and each call re-runs `Object.defineProperties`
 * plus `Object.freeze` to produce a value identical to the last one. In SSR profiles the branding
 * step alone was the single hottest library frame.
 *
 * **Only apply this to descriptors with no `surface`.** A capability that exposes state — every
 * model in `models/*.svelte.ts` that sets `surface:`, and everything under `bond-effects/` — must
 * keep one descriptor per host, or every Bond on the page would share one selection, one
 * collection, or one observer.
 *
 * Caching is skipped, not guessed, whenever the arguments cannot be keyed exactly: any function,
 * object nested more than one level deep, symbol, array, or class instance makes the call fall
 * through to a fresh descriptor. `tabPanelLink({ selected: () => this.isActive })` closes over an
 * instance and must never be shared — it takes that path automatically.
 */

/**
 * Distinct entries per factory. Options are drawn from a small fixed vocabulary in practice, so
 * this is a guard against a caller threading unbounded strings through a projection, not a tuning
 * parameter. Past the cap the factory still works; it just stops caching.
 */
const MAX_ENTRIES = 256;

/** Length-prefixed so a value containing the separator cannot forge a different key. */
function encode(value: unknown, allowObject: boolean): string | undefined {
	if (value === undefined) return 'u';
	if (value === null) return 'n';
	switch (typeof value) {
		case 'string':
			return `s${value.length}:${value}`;
		case 'number':
			return `d:${value}`;
		case 'boolean':
			return `b:${value ? 1 : 0}`;
		case 'bigint':
			return `g:${value}`;
		// A symbol is keyed by identity, which a string cannot capture; a function may close over
		// per-instance state. Both make the call uncacheable rather than wrongly shared.
		case 'symbol':
		case 'function':
			return undefined;
	}
	if (!allowObject || !isPlainObject(value)) return undefined;

	// One level only. Sorted keys so `{a,b}` and `{b,a}` intern to the same descriptor.
	const keys = Object.keys(value).sort();
	let key = 'o:';
	for (const name of keys) {
		const encoded = encode((value as Record<string, unknown>)[name], false);
		if (encoded === undefined) return undefined;
		key += `${name.length}:${name}=${encoded},`;
	}
	return key;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

function argumentsKey(args: readonly unknown[]): string | undefined {
	let key = '';
	for (const arg of args) {
		const encoded = encode(arg, true);
		if (encoded === undefined) return undefined;
		key += encoded + '|';
	}
	return key;
}

/**
 * Wraps a surface-less descriptor factory so equal primitive arguments yield one shared descriptor.
 *
 * The returned function has the factory's signature; callers are unchanged and unaware. Uncacheable
 * arguments fall through to the original factory, so behaviour is identical either way — the only
 * observable difference is reference identity, which nothing in the runtime depends on.
 */
/**
 * The argument-free case of {@link internCapabilityFactory}: one descriptor, built on first use.
 *
 * A factory taking no arguments has exactly one possible answer, so the general path spends a `Map`
 * and an `argumentsKey([])` string build per call to look up a value it can only ever find in one
 * place. Fifteen presentation capabilities across the component families are this shape, and each
 * had to be written as a *named function expression* purely to satisfy the interning wrapper.
 *
 * The same surface-less rule applies — a descriptor with state must be built per host — and is
 * enforced here in DEV exactly as it is there.
 */
export function lazyCapability<C extends object>(build: () => C): () => C {
	let descriptor: C | undefined;
	return (): C => {
		if (descriptor !== undefined) return descriptor;
		const created = build();
		if (DEV && (created as { surface?: unknown }).surface !== undefined) {
			console.error(
				`[ixirjs] lazyCapability(${build.name || 'anonymous'}): descriptor carries a surface and was not cached — sharing it would hand every host the same state.`
			);
			return created;
		}
		return (descriptor = created);
	};
}

export function internCapabilityFactory<A extends readonly unknown[], C extends object>(
	factory: (...args: A) => C
): (...args: A) => C {
	// Plain Map: module-lifetime descriptor cache, never reactive state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const cache = new Map<string, C>();
	return (...args: A): C => {
		const key = argumentsKey(args);
		if (key === undefined) return factory(...args);
		const existing = cache.get(key);
		if (existing !== undefined) return existing;
		const created = factory(...args);
		// The surface-less rule from this file's header, enforced where it is knowable. A surface is
		// per-host state; caching one would hand every Bond on the page the same selection, the same
		// collection, or the same observer, and the resulting bug would surface far from here.
		if (DEV && (created as { surface?: unknown }).surface !== undefined) {
			console.error(
				`[ixirjs] internCapabilityFactory(${factory.name || 'anonymous'}): descriptor carries a surface and was not cached — interning would share it across every host.`
			);
			return created;
		}
		if (cache.size < MAX_ENTRIES) cache.set(key, created);
		return created;
	};
}
