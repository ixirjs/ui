import { getContext, setContext } from 'svelte';
import { DEV } from 'esm-env';
import { BUILT_IN_PRESET_KEYS } from '$ixirjs/ui/preset/manifest';
import type {
	FallbackPreset,
	MergedPresetLayers,
	Preset,
	PresetContext,
	PresetEntry,
	PresetEntryValue,
	PresetModuleName
} from '$ixirjs/ui/preset/types';

export type {
	BuiltInPresetModuleMap,
	FallbackPreset,
	MergedPresetLayers,
	Motion,
	MotionAnimateFunction,
	MotionCleanup,
	MotionInitialFunction,
	MotionTransitionFunction,
	Preset,
	PresetContext,
	PresetEntry,
	PresetEntryRecord,
	PresetEntryValue,
	PresetKey,
	PresetLike,
	PresetModuleMap,
	PresetModuleName,
	PresetRender,
	ResolvedMotion
} from '$ixirjs/ui/preset/types';

const CONTEXT_KEY = '@ixirjs/context/preset';

export function fallbackPreset(...presets: readonly PresetModuleName[]): FallbackPreset {
	return Object.freeze({ kind: 'fallback-preset', presets: Object.freeze([...presets]) });
}

export function mergePresetLayers(...layers: readonly PresetEntryValue[]): MergedPresetLayers {
	return Object.freeze({ kind: 'merged-preset-layers', layers: Object.freeze([...layers]) });
}

/** Defines a checked, partial theme without exposing the registry representation. */
export function definePreset<const P extends Partial<Preset>>(preset: P): P {
	if (DEV) for (const key of Object.keys(preset)) warnOnMisspelledKey(key);
	return Object.freeze({ ...preset }) as P;
}

export function getPreset<K extends PresetModuleName>(key: K): PresetEntry | undefined;
export function getPreset(): Partial<Preset> | undefined;
export function getPreset(...args: unknown[]) {
	const preset = getContext<Partial<Preset> | undefined>(CONTEXT_KEY);
	if (args.length) return preset?.[args[0] as PresetModuleName];
	return preset;
}

function resolvePresetEntry(entry: PresetEntry, context: PresetContext): PresetEntryValue {
	return typeof entry === 'function' ? entry(context) : entry;
}

function mergePresetEntries(existing: PresetEntry, next: PresetEntry): PresetEntry {
	return (context) =>
		mergePresetLayers(resolvePresetEntry(existing, context), resolvePresetEntry(next, context));
}

// Unknown preset keys are *not* an error: an app may register slots for its own components through
// `PresetModuleMap` augmentation, and nothing at runtime can see that augmentation. So the check only
// fires on a near-miss of a shipped key — the shape a typo takes — and stays silent otherwise.
//
// Both entry points check, and the shared `warnedPresetKeys` keeps the pair from warning twice for a
// `definePreset` result later handed to `setPreset` — the common path.
const warnedPresetKeys = new Set<string>();
// A Set, not `BUILT_IN_PRESET_KEYS.includes`: `mergePreset` runs per render that installs a preset,
// so a linear scan of 210 keys per key per render is on the hot path even though the warning is not.
const knownPresetKeys = new Set<string>(BUILT_IN_PRESET_KEYS);

function warnOnMisspelledKey(key: string): void {
	if (knownPresetKeys.has(key) || warnedPresetKeys.has(key)) return;
	warnedPresetKeys.add(key);
	const limit = key.length <= 6 ? 1 : 2;
	let best: string | undefined;
	let bestDistance = limit + 1;
	for (const candidate of BUILT_IN_PRESET_KEYS as readonly string[]) {
		const distance = editDistance(key, candidate, bestDistance - 1);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = candidate;
		}
	}
	if (best) {
		console.warn(`[ixirjs] unknown preset key "${key}". Did you mean "${best}"?`);
	}
}

// Levenshtein, abandoned as soon as the whole row exceeds `max` — every shipped key is compared
// against every unknown one, so the bail-out is what keeps that quadratic sweep cheap.
function editDistance(a: string, b: string, max: number): number {
	if (Math.abs(a.length - b.length) > max) return max + 1;
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (let i = 1; i <= a.length; i++) {
		const row = [i];
		let rowMin = i;
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			const value = Math.min(previous[j]! + 1, row[j - 1]! + 1, previous[j - 1]! + cost);
			row.push(value);
			if (value < rowMin) rowMin = value;
		}
		if (rowMin > max) return max + 1;
		previous = row;
	}
	return previous[b.length]!;
}

// Context installation is initialization-scoped: call while creating the provider component.
// Runtime reactivity belongs inside entry factories, whose reads are tracked by presentation.
export function setPreset(preset: Partial<Preset>): void {
	mergePreset(() => preset);
}

export function mergePreset(
	callback: (currentPreset: Partial<Preset> | undefined) => Partial<Preset>
): void {
	const currentPreset = getPreset();
	const override = callback(currentPreset);
	const result: Partial<Preset> = { ...currentPreset };

	for (const key of Object.keys(override) as PresetModuleName[]) {
		const next = override[key];
		if (!next) continue;
		if (DEV) warnOnMisspelledKey(key);
		const existing = result[key];
		result[key] = existing ? mergePresetEntries(existing, next) : next;
	}

	setContext(CONTEXT_KEY, result);
}
