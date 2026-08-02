import type { Bond } from '$ixirjs/ui/shared';
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
import { getPreset } from '$ixirjs/ui/context';
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

type PresetRegistry = {
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
 * instance that resolves presentation — every `HtmlAtom`, plus the standalone callers (slider ×3,
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

/** Pure presentation evaluation; the Svelte adapter below supplies its tracked input getters. */
function resolvePresentationSnapshot<E extends Element = Element>(
	options: PresentationOptions<E>,
	registry: PresetRegistry
): PresentationSnapshot<E> {
	const bond = options.bond?.();
	const preset = resolvers.resolvePreset(
		options.preset?.(),
		bond,
		(key) => registry.get(key),
		() => registry.keys()
	);
	const restProps = options.restProps();
	const additional = options.variantProps?.();
	const variantProps = additional ? { ...restProps, ...additional } : restProps;
	const localVariantDef = options.variants?.();
	const localVariants = resolveLocalVariants(localVariantDef, bond ?? null, variantProps);
	const mergedVariants = resolvers.resolveVariants(preset, localVariants, bond, variantProps);
	const instanceLayer = resolvers.resolvePresetLayer(options.instance?.(), bond);
	const folded = resolvers.foldLayers(
		preset,
		mergedVariants,
		restProps,
		options.defaults?.(),
		options.motion?.(),
		instanceLayer,
		resolvers.resolveConsumedVariantKeys(preset, localVariantDef, bond)
	);

	return {
		preset,
		class: resolvers.resolveClass(options.class?.(), folded),
		attrs: folded.attrs,
		motion: folded.motion,
		as: options.as?.() ?? preset?.render?.as,
		base: options.base?.() ?? preset?.render?.base
	};
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
		return resolvePresentationSnapshot(options, registry);
	}

	// One coherent tracked snapshot replaces six stage-level signals. Resolver functions stay pure,
	// while dynamic preset and Bond reads remain tracked during this evaluation.
	const snapshot = $derived.by(() => resolvePresentationSnapshot(options, registry));

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
