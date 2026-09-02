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

// Module-level registry an app installs once at import time — config, not per-request state, so
// it is safe to share across requests the same way `defaultPreset` itself is. `setPreset`/
// `mergePreset` stay a subtree override layered over it via `getPreset()` below.
let installed: Partial<Preset> | undefined;

// Monotonic false→true: flips the first time a `setPreset`/`mergePreset` call runs, so `getPreset`
// knows a context override might exist and falls back to a context read. A stale `true` on a
// long-lived server can only make reads *more* conservative (today's behaviour), never wrong.
let contextPresetsInUse = false;

export function getPreset<K extends PresetModuleName>(key: K): PresetEntry | undefined;
export function getPreset(): Partial<Preset> | undefined;
export function getPreset(key?: PresetModuleName) {
	const preset = contextPresetsInUse
		? (getContext<Partial<Preset> | undefined>(CONTEXT_KEY) ?? installed)
		: installed;
	if (key) return preset?.[key];
	return preset;
}

// Shared by `installPreset` and `mergePreset` so the two merge rules cannot drift: same-key
// entries compose via `mergePresetEntries`, an unset override key is skipped, and DEV warns once
// on a near-miss of a shipped key.
function mergeIntoPreset(target: Partial<Preset>, override: Partial<Preset>): Partial<Preset> {
	for (const key of Object.keys(override) as PresetModuleName[]) {
		const next = override[key];
		if (!next) continue;
		if (DEV) warnOnMisspelledKey(key);
		const existing = target[key];
		// Re-installing the SAME entry is a no-op, not a self-merge: wrapping it in a merge closure
		// would break the `entry === defaultPreset[key]` identity `simpleRecord` caches on, and with
		// it the static fast path — for every part, after the second `installPreset(defaultPreset)`.
		if (existing === next) continue;
		target[key] = existing ? mergePresetEntries(existing, next) : next;
	}
	return target;
}

/**
 * Installs a preset into the module-level registry `getPreset()` falls back to. Config, not
 * per-request state — call once at module scope (a root layout, an entry file), never inside a
 * component: a per-request or per-tenant theme belongs on `setPreset` (context-scoped).
 */
export function installPreset(preset: Partial<Preset>): void {
	if (DEV) {
		let insideComponent: boolean;
		try {
			getContext(CONTEXT_KEY);
			insideComponent = true;
		} catch {
			insideComponent = false;
		}
		if (insideComponent) {
			console.warn(
				'[ixirjs] installPreset() called during component initialization. Install at module ' +
					'scope instead; use setPreset() for a subtree or per-request theme.'
			);
		}
	}
	installed = mergeIntoPreset({ ...installed }, preset);
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
	contextPresetsInUse = true;
	const currentPreset = getPreset();
	const override = callback(currentPreset);
	const result = mergeIntoPreset({ ...currentPreset }, override);
	setContext(CONTEXT_KEY, result);
}
