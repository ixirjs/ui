import type { ClassValue } from 'svelte/elements';
import { PRESET_SKIP, VARIANTS_SKIP } from './constants';
import { getCachedOwnSymbols } from './cache';

// Presentation merge kernel (ADR 0004 D5): one fold over fallback → preset → variants → rest,
// each later layer winning. Class axis captured separately for `mergeClassesWithPreset`.
export type FoldedPresentation = {
	// preset.class captured during the walk (before variants in cascade).
	presetClass: ClassValue | undefined;
	// variants.class captured during the walk (after preset in cascade).
	variantClass: ClassValue | undefined;
	// Spread-ready attrs: strings + symbols, cascade-merged, skip-sets applied.
	attrs: Record<string | symbol, unknown>;
};

// Copies own string-keyed props from `src` into `result`, skipping keys in `skip`.
function copyStringKeys(
	src: Record<string, unknown>,
	skip: ReadonlySet<string> | undefined,
	result: Record<string | symbol, unknown>
): void {
	for (const k in src) {
		if (!Object.hasOwn(src, k)) continue;
		if (skip && skip.has(k)) continue;
		result[k] = src[k];
	}
}

// Copies symbol-keyed props from `src` into `result`.
// `stable: true` uses the cached symbols path (for preset/variants layers); `false` scans live (rest props).
function copySymbolKeys(
	src: Record<string | symbol, unknown>,
	result: Record<string | symbol, unknown>,
	stable: boolean
): void {
	const syms = stable ? getCachedOwnSymbols(src) : Object.getOwnPropertySymbols(src);
	if (syms.length === 0) return;
	for (const s of syms) result[s] = src[s];
}

// Fold four presentation layers (fallback → preset → variants → rest) into a spread-ready shape.
export function foldPresentation(
	fallback: Record<string, unknown> | undefined,
	preset: Record<string, unknown> | undefined,
	variants: Record<string, unknown> | undefined,
	rest: Record<string, unknown>
): FoldedPresentation {
	const attrs: Record<string | symbol, unknown> = {};

	if (fallback) {
		copyStringKeys(fallback, PRESET_SKIP, attrs);
		copySymbolKeys(fallback, attrs, true);
	}
	if (preset) {
		copyStringKeys(preset, PRESET_SKIP, attrs);
		copySymbolKeys(preset, attrs, true);
	}
	if (variants) {
		copyStringKeys(variants, VARIANTS_SKIP, attrs);
		copySymbolKeys(variants, attrs, true);
	}
	copyStringKeys(rest, undefined, attrs);
	copySymbolKeys(rest, attrs, false);

	return {
		presetClass: preset?.class as ClassValue | undefined,
		variantClass: variants?.class as ClassValue | undefined,
		attrs
	};
}
