import { cn, type ClassValue } from '$svelte-atoms/core/utils';
import { PRESET_SKIP, VARIANTS_SKIP } from './constants';
import type { ResolvedProps } from './cache';

// Frozen pre-Decision-5 implementations — benchmark baseline for presentation.bench.ts / memory.spec.ts.
// Do not fix or import from production code.

export function legacyMergeClassesWithPreset(
	userClass: string | ClassValue | undefined,
	presetClass: ClassValue | undefined,
	variantClass: ClassValue | undefined
): string {
	if (typeof userClass === 'string') {
		if (userClass.indexOf('$preset') === -1) {
			return cn(userClass, variantClass ?? '');
		}
	} else if (userClass == null) {
		return cn(variantClass ?? '');
	} else {
		// Non-string ClassValue — legacy flattened with FULL cn (clsx + twMerge)
		// just to find the placeholder, then ran cn again. Two twMerge passes.
		const merged = cn(userClass);
		if (merged.indexOf('$preset') === -1) {
			return cn(merged, variantClass ?? '');
		}
		const lastIdx = merged.lastIndexOf('$preset');
		return cn(
			merged.slice(0, lastIdx),
			cn(presetClass),
			variantClass ?? '',
			merged.slice(lastIdx + '$preset'.length)
		);
	}

	const klassStr = userClass as string;
	const lastIdx = klassStr.lastIndexOf('$preset');
	const beforeLastPlaceholder = klassStr.slice(0, lastIdx);
	const afterLastPlaceholder = klassStr.slice(lastIdx + '$preset'.length);
	const presetClassString = cn(presetClass);

	return cn(beforeLastPlaceholder, presetClassString, variantClass ?? '', afterLastPlaceholder);
}

function legacyCopyStringKeys(
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

function legacyCopySymbolKeys(
	src: Record<string | symbol, unknown>,
	result: Record<string | symbol, unknown>
): void {
	const syms = Object.getOwnPropertySymbols(src);
	if (syms.length === 0) return;
	for (const s of syms) result[s] = src[s];
}

export function legacyExtractRestProps(
	preset: Record<string, unknown> | undefined,
	mergedVariants: ResolvedProps | undefined,
	restProps: Record<string, unknown>,
	fallback?: Record<string, unknown> | undefined
): Record<string, unknown> {
	const result: Record<string | symbol, unknown> = {};
	if (fallback) {
		legacyCopyStringKeys(fallback, PRESET_SKIP, result);
		legacyCopySymbolKeys(fallback, result);
	}
	if (preset) {
		legacyCopyStringKeys(preset, PRESET_SKIP, result);
		legacyCopySymbolKeys(preset, result);
	}
	if (mergedVariants) {
		legacyCopyStringKeys(mergedVariants, VARIANTS_SKIP, result);
		legacyCopySymbolKeys(mergedVariants, result);
	}
	legacyCopyStringKeys(restProps, undefined, result);
	legacyCopySymbolKeys(restProps, result);
	return result as Record<string, unknown>;
}
