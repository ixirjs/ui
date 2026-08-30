import type { ClassValue } from 'svelte/elements';
import type { TransitionConfig } from 'svelte/transition';
import type { Base } from '$ixirjs/ui/authoring';
import type { BondLike as Bond } from '$ixirjs/ui/kernel/types';
import type { BuiltInPresetName } from './manifest';

export type MotionCleanup<T extends Element = Element> =
	| void
	| ((node: T) => void)
	| { stop(): void };
export type MotionInitialFunction<T extends Element = Element> = (node: T) => void;
export type MotionTransitionFunction<T extends Element = Element> = (
	node: T
) => Partial<TransitionConfig> | void;
export type MotionAnimateFunction<T extends Element = Element> = (node: T) => MotionCleanup<T>;

/** Renderer-owned motion channels. `null` explicitly disables a phase. */
export interface Motion<T extends Element = Element> {
	initial?: MotionInitialFunction<T> | null | undefined;
	enter?: MotionTransitionFunction<T> | null | undefined;
	exit?: MotionTransitionFunction<T> | null | undefined;
	animate?: MotionAnimateFunction<T> | null | undefined;
}

export type ResolvedMotion<T extends Element = Element> = {
	[K in keyof Motion<T>]?: Exclude<Motion<T>[K], null | undefined>;
};

export interface PresetRender {
	as?: string;
	base?: Base;
}

// Stable preset data is deliberately closed. DOM-facing values live under `attrs` so adding
// future configuration fields cannot reinterpret an attribute consumers already publish.
export interface PresetEntryRecord {
	class?: ClassValue;
	attrs?: Record<string, unknown>;
	motion?: Motion | null | undefined;
	variants?: Record<string, Record<string, unknown>>;
	compounds?: Array<Record<string, unknown>>;
	defaults?: Record<string, unknown>;
	render?: PresetRender;
}

export interface MergedPresetLayers {
	readonly kind: 'merged-preset-layers';
	readonly layers: readonly PresetEntryValue[];
}

// Named layer objects replace the old overloaded array and nested-factory forms.
export type PresetEntryValue = PresetEntryRecord | MergedPresetLayers;

export interface PresetContext {
	bond: Bond | undefined | null;
}

export type PresetEntry = (context: PresetContext) => PresetEntryValue;

/** A direct, per-instance presentation layer or a bond-aware layer factory. */
export type PresetLike = PresetEntryValue | PresetEntry;

export type BuiltInPresetModuleMap = { [K in BuiltInPresetName]: PresetEntry };

// This is the single public augmentation seam. Application code extends it through
// `declare module '@ixirjs/ui/preset'`.
export interface PresetModuleMap extends BuiltInPresetModuleMap {}

export type PresetModuleName = keyof PresetModuleMap & string;
export type Preset = { [K in PresetModuleName]: PresetModuleMap[K] };

export interface FallbackPreset {
	readonly kind: 'fallback-preset';
	readonly presets: readonly PresetModuleName[];
}

export type PresetKey = PresetModuleName | FallbackPreset;
