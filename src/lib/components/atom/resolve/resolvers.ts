import { DEV } from 'esm-env';
import type { ClassValue } from 'svelte/elements';
import type { Bond } from '$ixirjs/ui/shared';
import { VARIANT_DEF_TAG } from '$ixirjs/ui/utils';
import { BUILT_IN_PRESET_KEYS } from '$ixirjs/ui/preset/manifest';
import type {
	FallbackPreset,
	Motion,
	PresetEntry,
	PresetEntryRecord,
	PresetKey,
	PresetLike,
	PresetModuleName
} from '$ixirjs/ui/preset';
import type { ResolvedProps } from './cache';
import type { FoldedPresentation } from './fold';
import type { Variants } from '$ixirjs/ui/components/atom/types';
import * as utils from './index';

export function resolvePreset(
	presetKey: PresetKey | undefined,
	bond: Bond | undefined,
	getPreset: (key: PresetModuleName) => PresetEntry | undefined,
	getPresetKeys?: () => readonly string[]
): PresetEntryRecord | undefined {
	if (!presetKey) return undefined;
	if (typeof presetKey === 'string') {
		const entry = getPreset(presetKey);
		if (!entry) warnMissingPreset(presetKey, getPresetKeys);
		return entry ? resolveEntry(entry, bond) : undefined;
	}
	for (const key of (presetKey as FallbackPreset).presets) {
		const entry = getPreset(key);
		if (entry) return resolveEntry(entry, bond);
	}
	return undefined;
}

function resolveEntry(entry: PresetEntry, bond: Bond | undefined): PresetEntryRecord | undefined {
	if (typeof entry !== 'function') return utils.resolvePreset(entry);
	return utils.resolvePreset(entry({ bond })) as PresetEntryRecord | undefined;
}

let warnedPresetKeys: Set<string> | undefined;

function warnMissingPreset(
	key: string,
	getPresetKeys: (() => readonly string[]) | undefined
): void {
	if (!DEV || warnedPresetKeys?.has(key)) return;

	const registeredKeys = new Set(getPresetKeys?.() ?? []);
	if (BUILT_IN_PRESET_KEYS.includes(key as (typeof BUILT_IN_PRESET_KEYS)[number])) return;
	if (registeredKeys.has(key)) return;

	const candidates = new Set<string>(BUILT_IN_PRESET_KEYS);
	for (const candidate of registeredKeys) candidates.add(candidate);
	const suggestion = findPresetSuggestion(key, candidates);

	(warnedPresetKeys ??= new Set()).add(key);
	console.warn(
		suggestion
			? `[ixirjs] Unknown preset key "${key}". Did you mean "${suggestion}"?`
			: `[ixirjs] Unknown preset key "${key}". No preset is registered for this key.`
	);
}

function findPresetSuggestion(key: string, candidates: Iterable<string>): string | undefined {
	let closest: string | undefined;
	let closestDistance = Infinity;

	for (const candidate of candidates) {
		const distance = editDistance(key, candidate);
		if (
			distance < closestDistance ||
			(distance === closestDistance && candidate < (closest ?? '\uffff'))
		) {
			closest = candidate;
			closestDistance = distance;
		}
	}

	const maximumDistance = Math.max(1, Math.floor(key.length / 4));
	return closestDistance <= maximumDistance ? closest : undefined;
}

function editDistance(left: string, right: string): number {
	const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

	for (let row = 1; row <= left.length; row++) {
		let diagonal = previous[0]!;
		previous[0] = row;
		for (let column = 1; column <= right.length; column++) {
			const above = previous[column]!;
			previous[column] =
				left[row - 1] === right[column - 1]
					? diagonal
					: 1 + Math.min(diagonal, above, previous[column - 1]!);
			diagonal = above;
		}
	}

	return previous[right.length]!;
}

export function resolvePresetLayer(
	layer: PresetLike | undefined,
	bond: Bond | undefined
): PresetEntryRecord | undefined {
	if (!layer) return undefined;
	if (typeof layer === 'function') return resolveEntry(layer, bond);
	return utils.resolvePreset(layer);
}

export function resolveVariants(
	preset: PresetEntryRecord | undefined,
	localVariants: ResolvedProps | undefined,
	bond: Bond | undefined,
	restProps: Record<string, unknown>
): ResolvedProps | undefined {
	return utils.mergeVariants(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset?.variants as Record<string, any> | undefined,
		preset?.class,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset?.compounds as Array<Record<string, any>> | undefined,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset?.defaults as Record<string, any> | undefined,
		localVariants,
		bond ?? null,
		restProps
	);
}

/**
 * Prop names both variant sources consume as selectors, so the fold can keep them off the element.
 *
 * A local definition given as a bare function computes its own props and cannot be introspected, so
 * nothing is claimed for it — that path keeps today's behaviour rather than guessing at a key set.
 */
export function resolveConsumedVariantKeys(
	preset: PresetEntryRecord | undefined,
	localVariants: Variants | undefined,
	bond: Bond | undefined
): ReadonlySet<string> | undefined {
	const fromPreset = utils.variantSelectorKeys(
		preset?.variants as Record<string, unknown> | undefined,
		preset?.compounds as ReadonlyArray<Record<string, unknown>> | undefined
	);
	// No shipped component passes a local definition, so keep that path off the common one entirely.
	if (localVariants === undefined) return fromPreset;

	const local = localVariantDefinition(localVariants, bond);
	const fromLocal = utils.variantSelectorKeys(local?.variants, local?.compounds);
	if (!fromLocal?.size) return fromPreset;
	if (!fromPreset?.size) return fromLocal;
	return new Set([...fromPreset, ...fromLocal]);
}

// Mirrors `resolveLocalVariants`' own unwrapping; a plain function stays opaque by design.
function localVariantDefinition(
	variants: Variants | undefined,
	bond: Bond | undefined
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
):
	| { variants?: Record<string, unknown>; compounds?: ReadonlyArray<Record<string, unknown>> }
	| undefined {
	if (!variants) return undefined;
	if (typeof variants === 'function') {
		if (!(VARIANT_DEF_TAG in variants)) return undefined;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const config = (variants as any)[VARIANT_DEF_TAG];
		const resolved = typeof config === 'function' ? config(bond ?? null) : config;
		return resolved && typeof resolved === 'object' ? resolved : undefined;
	}
	// An object definition is a `VariantDefinition`, never a bare selector map — `resolveVariants`
	// reads `variants`/`compounds` off it and ignores anything else. Claiming a key it does not read
	// would strip an attribute nothing consumed.
	return variants as { variants?: Record<string, unknown> };
}

export function foldLayers<E extends Element = Element>(
	preset: PresetEntryRecord | undefined,
	variants: ResolvedProps | undefined,
	restProps: Record<string, unknown>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	defaults: Record<string, any> | undefined,
	consumerMotion?: Motion<E> | null,
	instance?: PresetEntryRecord | undefined,
	consumed?: ReadonlySet<string> | undefined
): FoldedPresentation<E> {
	return utils.foldPresentation(
		defaults,
		preset,
		variants,
		restProps,
		consumerMotion,
		instance,
		consumed
	);
}

export function resolveClass(
	klass: ClassValue | null | undefined,
	folded: Pick<FoldedPresentation, 'presetClass' | 'variantClass'> & {
		instanceClass?: FoldedPresentation['instanceClass'];
	}
): string {
	const variantClass =
		folded.instanceClass === undefined
			? folded.variantClass
			: [folded.variantClass, folded.instanceClass];
	return utils.mergeClassesWithPreset(klass ?? undefined, folded.presetClass, variantClass);
}
