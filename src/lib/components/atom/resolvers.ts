import type { ClassValue } from 'svelte/elements';
import type { Bond } from '$svelte-atoms/core/shared';
import type { PresetEntryRecord } from '$svelte-atoms/core/context/preset.svelte';
import type { ResolvedProps } from './utils/cache';
import type { FoldedPresentation } from './utils/fold';
import type { Variants } from './types';
import * as utils from './utils';

// Presentation cascade for HtmlAtom. Each exported function resolves one stage so the
// .svelte's $derived wrappers track minimal dependencies. Merge order (last wins):
//     fallback → preset → variants → restProps
// Pinned by resolvers.spec.ts + fold.spec.ts. The cascade runs via ONE foldPresentation
// kernel call (ADR 0004 D5) — foldLayers walks all four layers once.

// Resolve the preset record from a preset key or ordered fallback chain (first registered wins).
export function resolvePreset(
	presetKey: string | string[] | undefined,
	bond: Bond | undefined,
	getPreset: (key: string) => ((bond: Bond | undefined) => unknown) | undefined
): PresetEntryRecord | undefined {
	if (!presetKey) return undefined;
	if (typeof presetKey === 'string') {
		const entry = getPreset(presetKey);
		return entry ? resolveEntry(entry, bond) : undefined;
	}
	for (const key of presetKey) {
		if (!key) continue;
		const entry = getPreset(key);
		if (!entry) continue;
		return resolveEntry(entry, bond);
	}
	return undefined;
}

// Run a preset entry factory and stabilize the resulting record's reference identity.
// The entry still runs first so reactive reads inside the factory stay tracked.
function resolveEntry(
	entry: (bond: Bond | undefined) => unknown,
	bond: Bond | undefined
): PresetEntryRecord | undefined {
	const fresh = utils.resolvePreset(entry(bond)) as PresetEntryRecord | undefined;
	if (!fresh) return undefined;
	return utils.stabilizePresetRecord(entry, bond, fresh);
}

// Resolve the locally-supplied variant definition (or function) against bond + props.
export function resolveLocalVariants(
	variants: Variants | undefined,
	bond: Bond | undefined,
	restProps: Record<string, unknown>
): ResolvedProps | undefined {
	return utils.resolveLocalVariants(variants, bond ?? null, restProps);
}

// Resolve the effective variants: preset's definitions merged with local ones (local wins; classes concatenate).
export function resolveVariants(
	preset: PresetEntryRecord | undefined,
	localVariants: ResolvedProps | undefined,
	bond: Bond | undefined,
	restProps: Record<string, unknown>
): ResolvedProps | undefined {
	return utils.mergeVariants(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset?.variants as Record<string, any> | undefined,
		preset?.class as ClassValue | undefined,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset?.compounds as Array<Record<string, any>> | undefined,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset?.defaults as Record<string, any> | undefined,
		localVariants,
		bond ?? null,
		restProps
	);
}

// Run the merge kernel — ONE walk over fallback → preset → variants → rest layers,
// producing spread-ready attrs plus captured class-axis inputs.
export function foldLayers(
	preset: PresetEntryRecord | undefined,
	variants: ResolvedProps | undefined,
	restProps: Record<string, unknown>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fallback: Record<string, any> | undefined
): FoldedPresentation {
	return utils.foldPresentation(fallback, preset, variants, restProps);
}

// Resolve the final class string: user class + fold's preset/variant classes (honoring $preset).
// Memoized for all-string inputs so a rest-prop-only fold invalidation re-resolves from cache.
export function resolveClass(klass: ClassValue, folded: FoldedPresentation): string {
	return utils.mergeClassesWithPreset(klass, folded.presetClass, folded.variantClass);
}

// Resolve `base` — caller's `base` prop takes precedence over preset.base.
export function resolveBase(base: unknown, preset: PresetEntryRecord | undefined): unknown {
	return base ?? preset?.base;
}

// Resolve `as` — caller's `as` prop takes precedence over preset.as.
export function resolveAs(as: unknown, preset: PresetEntryRecord | undefined): unknown {
	return as ?? preset?.as;
}

// Resolve spread-ready rest props via cascade fallback → preset → variants → restProps (last wins).
// Internal atom keys (class, base, as, …) are stripped; symbol-keyed attachments are preserved.
export function resolveRestProps(
	preset: PresetEntryRecord | undefined,
	variants: ResolvedProps | undefined,
	restProps: Record<string, unknown>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fallback: Record<string, any> | undefined
): Record<string, unknown> {
	return utils.extractRestProps(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset as Record<string, any> | undefined,
		variants,
		restProps,
		fallback
	);
}

// True when the resolved base is a snippet (vs. a component).
export function isSnippetBase(base: unknown): boolean {
	return utils.isSnippetBase(base);
}
