import type { ClassValue } from 'svelte/elements';
import type { Motion, PresetEntryRecord, ResolvedMotion } from '$ixirjs/ui/preset';
import { MOTION_SKIP, PRESET_SKIP, VARIANTS_SKIP } from './constants';
import { getCachedOwnSymbols } from './cache';
import { EMPTY_RESOLVED_MOTION, extractMotion, resolveMotionLayers } from './motion';

export type FoldedPresentation<E extends Element = Element> = {
	presetClass: ClassValue | undefined;
	variantClass: ClassValue | undefined;
	instanceClass: ClassValue | undefined;
	attrs: Record<string | symbol, unknown>;
	motion: ResolvedMotion<E>;
};

function copyStringKeys(
	src: Record<string, unknown>,
	skip: ReadonlySet<string> | undefined,
	result: Record<string | symbol, unknown>
): void {
	for (const key in src) {
		if (!Object.hasOwn(src, key) || skip?.has(key) || MOTION_SKIP.has(key)) continue;
		result[key] = src[key];
	}
}

function copySymbolKeys(
	src: Record<string | symbol, unknown>,
	result: Record<string | symbol, unknown>,
	stable: boolean
): void {
	const symbols = stable ? getCachedOwnSymbols(src) : Object.getOwnPropertySymbols(src);
	for (const symbol of symbols) result[symbol] = src[symbol];
}

// The canonical attrs axis. Attr-only consumers avoid paying to resolve an unused motion axis.
/** Whether a layer carries any renderer-owned motion key, which the fold must strip from attrs. */
function hasMotionKeys(src: Record<string, unknown>): boolean {
	for (const key of MOTION_SKIP) {
		if (key in src) return true;
	}
	return false;
}

export function foldPresentationAttrs(
	defaults: Record<string, unknown> | undefined,
	preset: PresetEntryRecord | undefined,
	variants: Record<string, unknown> | undefined,
	rest: Record<string, unknown>,
	instance?: PresetEntryRecord | undefined,
	// Prop names consumed as variant selectors — see `variantSelectorKeys`. Stripped from `rest`
	// only, so a prop no definition declares still reaches the element.
	consumed?: ReadonlySet<string> | undefined
): Record<string | symbol, unknown> {
	// Passthrough: with no layer to fold in and no motion key to strip, the fold would copy `rest`
	// key by key into a fresh object and return an exact duplicate. Every rendered part pays for
	// that, so hand back the same reference instead — Kernel and HtmlElement treat attrs as immutable.
	//
	// `consumed` is non-empty only when a variants definition resolved, which also makes `variants`
	// defined; the explicit check keeps that from being a standing assumption about the caller.
	if (
		!defaults &&
		!preset?.attrs &&
		!variants &&
		!instance?.attrs &&
		!consumed?.size &&
		!hasMotionKeys(rest)
	) {
		return rest;
	}

	const attrs: Record<string | symbol, unknown> = {};

	if (defaults) {
		copyStringKeys(defaults, PRESET_SKIP, attrs);
		copySymbolKeys(defaults, attrs, true);
	}
	if (preset?.attrs) {
		// Preset attrs are DOM data, never lifecycle attachments. String keys only are supported.
		copyStringKeys(preset.attrs, PRESET_SKIP, attrs);
	}
	if (variants) {
		copyStringKeys(variants, VARIANTS_SKIP, attrs);
		copySymbolKeys(variants, attrs, true);
	}
	if (instance?.attrs) copyStringKeys(instance.attrs, PRESET_SKIP, attrs);
	copyStringKeys(rest, consumed, attrs);
	copySymbolKeys(rest, attrs, false);
	return attrs;
}

// One cascade for native defaults, closed preset attrs, resolved variants, consumer props, and motion.
export function foldPresentation<E extends Element = Element>(
	defaults: Record<string, unknown> | undefined,
	preset: PresetEntryRecord | undefined,
	variants: Record<string, unknown> | undefined,
	rest: Record<string, unknown>,
	consumerMotion?: Motion<E> | null,
	instance?: PresetEntryRecord | undefined,
	consumed?: ReadonlySet<string> | undefined
): FoldedPresentation<E> {
	return {
		presetClass: preset?.class,
		variantClass: variants?.class as ClassValue | undefined,
		instanceClass: instance?.class,
		attrs: foldPresentationAttrs(defaults, preset, variants, rest, instance, consumed),
		motion: foldMotion(defaults, preset, variants, rest, consumerMotion, instance)
	};
}

// Most parts declare no motion at all. `extractMotion` is already a cheap key probe, so ask each
// layer first and only build the layer array when something is actually there — that array was
// otherwise allocated once per rendered part purely to be folded into the shared empty result.
function foldMotion<E extends Element = Element>(
	defaults: Record<string, unknown> | undefined,
	preset: PresetEntryRecord | undefined,
	variants: Record<string, unknown> | undefined,
	rest: Record<string, unknown>,
	consumerMotion: Motion<E> | null | undefined,
	instance: PresetEntryRecord | undefined
): ResolvedMotion<E> {
	const defaultsMotion = extractMotion(defaults);
	const variantsMotion = extractMotion(variants);
	const restMotion = extractMotion(rest);
	const presetMotion = preset?.motion;
	const instanceMotion = instance?.motion;

	if (
		defaultsMotion === undefined &&
		presetMotion === undefined &&
		variantsMotion === undefined &&
		instanceMotion === undefined &&
		restMotion === undefined &&
		(consumerMotion === undefined || consumerMotion === null)
	) {
		return EMPTY_RESOLVED_MOTION as ResolvedMotion<E>;
	}

	return resolveMotionLayers([
		defaultsMotion,
		presetMotion,
		variantsMotion,
		instanceMotion,
		restMotion,
		consumerMotion
	]);
}
