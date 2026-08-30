import type { BondLike as Bond } from '$ixirjs/ui/kernel/types';
import type {
	Motion,
	Preset,
	PresetKey,
	PresetEntry,
	PresetEntryRecord,
	PresetLike,
	PresetModuleName,
	ResolvedMotion
} from '$ixirjs/ui/preset';
import type { ClassValue } from 'svelte/elements';
import type { Variants } from './types';
import * as resolvers from './resolve/resolvers';
import { resolveLocalVariants } from './resolve/variants';
import { getPreset } from '$ixirjs/ui/preset/context.svelte';
import { BROWSER } from 'esm-env';

/**
 * Shared presentation seam for full and lightweight renderers.
 *
 * Call this during component initialization. The returned getters intentionally expose the
 * derived values without copying the caller's rest-props proxy; each resolver remains tracked at
 * the component-owned boundary.
 */
export type PresentationOptions<E extends Element = Element> = {
	preset?: () => PresetKey | undefined;
	bond?: () => Bond | undefined;
	variants?: () => Variants | undefined;
	defaults?: () => Record<string, unknown> | undefined;
	class?: (() => ClassValue | null | undefined) | undefined;
	as?: (() => unknown) | undefined;
	base?: (() => unknown) | undefined;
	/** Additional known component props used to select preset variants without leaking them as attrs. */
	variantProps?: (() => Record<string, unknown> | undefined) | undefined;
	/** Explicit consumer motion, kept separate from the rest-props proxy. */
	motion?: (() => Motion<E> | null | undefined) | undefined;
	/** Optional per-instance layer, resolved after variants and before consumer attrs. */
	instance?: (() => PresetLike | undefined) | undefined;
	restProps: () => Record<string, unknown>;
};

export type PresentationSnapshot<E extends Element = Element> = {
	readonly preset: PresetEntryRecord | undefined;
	readonly class: string;
	readonly attrs: Record<string | symbol, unknown>;
	readonly motion: ResolvedMotion<E>;
	readonly as: unknown;
	readonly base: unknown;
};

export type PresetRegistry = {
	get(key: PresetModuleName): PresetEntry | undefined;
	keys(): readonly string[];
};

const EMPTY_PRESET_KEYS: readonly string[] = Object.freeze([]);
const NO_PRESET_REGISTRY: PresetRegistry = Object.freeze({
	get: () => undefined,
	keys: () => EMPTY_PRESET_KEYS
});

/**
 * One registry per installed preset, not per rendered part.
 *
 * The registry is a pure view of the context value: `setPreset`/`mergePreset` build a new object
 * and install it once at provider initialization, and nothing mutates it afterwards. Building it
 * inside `createPresentation` therefore allocated one object and two closures for every component
 * instance that resolves presentation — every Kernel element plus standalone callers (slider ×3,
 * switch, input, textarea, both element renderers) — to describe a value that changes at most once
 * per provider. Keyed weakly so a torn-down provider's registry is collectable with it.
 *
 * `keys()` stays lazy: it exists only for the DEV unknown-preset-key diagnostic, so precomputing it
 * would move an `Object.keys` walk off the miss path and onto every installation.
 */
const presetRegistries = new WeakMap<object, PresetRegistry>();

function presetRegistry(installed: Partial<Preset> | undefined): PresetRegistry {
	if (!installed) return NO_PRESET_REGISTRY;
	let registry = presetRegistries.get(installed);
	if (!registry) {
		let keys: readonly string[] | undefined;
		registry = {
			get: (key) => installed[key],
			keys: () => (keys ??= Object.keys(installed))
		};
		presetRegistries.set(installed, registry);
	}
	return registry;
}

/**
 * The eleven inputs, already read. `PresentationOptions` is the *thunk* shape — one closure per
 * axis, allocated per rendered part — which exists so the browser can read every axis inside one
 * tracked evaluation. A server render has no tracking to do, so those closures were eleven
 * allocations and eleven calls per part to deliver values the caller already held.
 *
 * Splitting the shape lets the server hand over plain values (see `resolvePresentation`) while the
 * browser still builds them inside its `$derived`. One resolver, two callers.
 */
export type PresentationValues<E extends Element = Element> = {
	preset: PresetKey | undefined;
	bond: Bond | undefined;
	variants: Variants | undefined;
	defaults: Record<string, unknown> | undefined;
	class: ClassValue | null | undefined;
	as: unknown;
	base: unknown;
	variantProps: Record<string, unknown> | undefined;
	motion: Motion<E> | null | undefined;
	instance: PresetLike | undefined;
	restProps: Record<string, unknown>;
};

/** Reads every axis of the thunk shape. Must stay inside the caller's tracked boundary. */
function readValues<E extends Element = Element>(
	options: PresentationOptions<E>
): PresentationValues<E> {
	return {
		preset: options.preset?.(),
		bond: options.bond?.(),
		variants: options.variants?.(),
		defaults: options.defaults?.(),
		class: options.class?.(),
		as: options.as?.(),
		base: options.base?.(),
		variantProps: options.variantProps?.(),
		motion: options.motion?.(),
		instance: options.instance?.(),
		restProps: options.restProps()
	};
}

/** Pure presentation evaluation over already-read inputs. */
export function resolvePresentation<E extends Element = Element>(
	values: PresentationValues<E>,
	registry: PresetRegistry
): PresentationSnapshot<E> {
	const bond = values.bond;
	// The registry's own methods, not two fresh closures wrapping them. `get` and `keys` are already
	// `this`-free arrows created once per installed preset and cached in `presetRegistries`, so the
	// wrappers added two allocations per rendered element to call functions that were in hand.
	const preset = resolvers.resolvePreset(values.preset, bond, registry.get, registry.keys);
	const restProps = values.restProps;
	const additional = values.variantProps;
	const localVariantDef = values.variants;
	// Merged only when something will read it. `resolveLocalVariants` and `mergeVariants` are the
	// only consumers and both return before touching `props` unless a variants source exists — so a
	// root passing `variantProps: root.props` was allocating one object and invoking one accessor
	// per Bond prop, on every rendered root, for a value nothing looked at. Eleven roots do this.
	const variantProps =
		additional && (localVariantDef !== undefined || preset?.variants !== undefined)
			? { ...restProps, ...additional }
			: restProps;
	const localVariants = resolveLocalVariants(localVariantDef, bond ?? null, variantProps);
	const mergedVariants = resolvers.resolveVariants(preset, localVariants, bond, variantProps);
	const instanceLayer = resolvers.resolvePresetLayer(values.instance, bond);
	const folded = resolvers.foldLayers(
		preset,
		mergedVariants,
		restProps,
		values.defaults,
		values.motion,
		instanceLayer,
		resolvers.resolveConsumedVariantKeys(preset, localVariantDef, bond)
	);

	return {
		preset,
		class: resolvers.resolveClass(values.class, folded),
		attrs: folded.attrs,
		motion: folded.motion,
		as: values.as ?? preset?.render?.as,
		base: values.base ?? preset?.render?.base
	};
}

/**
 * One tracked snapshot over a resolver the caller already owns.
 *
 * `createPresentation` takes eleven thunks so its `$derived` can re-read every axis; a caller that
 * already holds its config as ONE tracked value (`useKernelElement`'s `props` derived) has nothing
 * to gain from that shape — it paid eleven closures, `readValues`' eleven calls and a six-accessor
 * view object per rendered part to hand over values it had in hand. This is the same server/browser
 * split with the resolver inlined by the caller: one `$derived.by`, one thunk, no accessors.
 */
export function createSnapshot<T>(compute: () => T): () => T {
	if (!BROWSER) {
		const once = compute();
		return () => once;
	}
	const snapshot = $derived.by(compute);
	return () => snapshot;
}

/**
 * The installed preset's registry, for callers that resolve presentation themselves rather than
 * through {@link createPresentation}. Initialization-scoped, exactly as it is there.
 */
export function presentationRegistry(): PresetRegistry {
	return presetRegistry(getPreset());
}

export function createPresentation<E extends Element = Element>(
	options: PresentationOptions<E>
): PresentationSnapshot<E> {
	// Preset installation is initialization-scoped. Capture the registry once; reactive variation
	// belongs inside entry factories and is still tracked while the snapshot evaluates.
	const registry = presetRegistry(getPreset());

	// Server fast path. A server render is a single pass with no reactive updates, so the tracked
	// snapshot can only ever be computed once — the signal, its `once` wrapper, and the six-accessor
	// view object are all pure overhead there. Resolving eagerly returns the same snapshot object
	// the getters would have forwarded to, and accessor-object allocation is the single largest
	// per-part cost in SSR profiles. Evaluating at init rather than at first read is safe because
	// every caller reads the presentation during its own render, after its Atom and Bond are wired.
	if (!BROWSER) {
		return resolvePresentation(readValues(options), registry);
	}

	// One coherent tracked snapshot replaces six stage-level signals. Resolver functions stay pure,
	// while dynamic preset and Bond reads remain tracked during this evaluation — which is why the
	// axes are read inside the derived rather than hoisted out of it.
	const snapshot = $derived.by(() => resolvePresentation(readValues(options), registry));

	return {
		get preset() {
			return snapshot.preset;
		},
		get class() {
			return snapshot.class;
		},
		get attrs() {
			return snapshot.attrs;
		},
		get motion() {
			return snapshot.motion;
		},
		get as() {
			return snapshot.as;
		},
		get base() {
			return snapshot.base;
		}
	};
}
