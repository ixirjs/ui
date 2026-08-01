export { defaultPreset } from './default';
import {
	definePreset as definePresetInternal,
	fallbackPreset as fallbackPresetInternal,
	mergePresetLayers as mergePresetLayersInternal,
	setPreset as setPresetInternal
} from '$ixirjs/ui/context/preset.svelte';
import type {
	FallbackPreset,
	MergedPresetLayers,
	Preset,
	PresetEntryValue,
	PresetModuleName
} from './types';

export { BUILT_IN_PRESET_KEYS, type BuiltInPresetName } from './manifest';
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
} from './types';

/** Defines a checked, partial theme against the public, augmentable preset registry. */
export function definePreset<const P extends Partial<Preset>>(preset: P): P {
	return definePresetInternal(preset) as P;
}

export function setPreset(preset: Partial<Preset>): void {
	setPresetInternal(preset as Parameters<typeof setPresetInternal>[0]);
}

export function fallbackPreset(...presets: readonly PresetModuleName[]): FallbackPreset {
	return fallbackPresetInternal(...presets);
}

export function mergePresetLayers(...layers: readonly PresetEntryValue[]): MergedPresetLayers {
	return mergePresetLayersInternal(...layers);
}
