import type { Snippet } from 'svelte';
import type { PlainPartProps } from '$ixirjs/ui/authoring';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';

export type SliderResolvedPartProps = Record<string, unknown>;

export interface SliderThumbContentProps {
	/** Current value of the control. */
	value: number;
	/** The value as a 0–1 fraction of the track, ready for positioning. */
	percent: number;
	/** Resolved presentation props for this part — spread them so preset styling survives the override. */
	props: SliderResolvedPartProps;
}

export interface SliderTrackContentProps {
	/** Current value of the control. */
	value: number;
	/** The value as a 0–1 fraction of the track, ready for positioning. */
	percent: number;
	/** Lowest accepted value. Values below it are rejected. */
	min: number;
	/** Highest accepted value. Values above it are rejected. */
	max: number;
	/** Resolved presentation props for this part — spread them so preset styling survives the override. */
	props: SliderResolvedPartProps;
}

export interface SliderValueChangeDetails {
	/** The value as a 0–1 fraction of the track, ready for positioning. */
	percent: number;
	min: number;
	max: number;
	step: number;
	type: 'number';
}

type SliderStateChangeCallback = StateChangeCallback<number>;

export interface SliderPresets {
	/** Presentation layer for the track slot. */
	track?: PresetLike;
	/** Presentation layer for the fill slot. */
	fill?: PresetLike;
	/** Presentation layer for the thumb slot. */
	thumb?: PresetLike;
}

export type SliderValueChangeCallback = (
	value: Parameters<SliderStateChangeCallback>[0],
	context: Parameters<SliderStateChangeCallback>[1] & SliderValueChangeDetails
) => ReturnType<SliderStateChangeCallback>;

// The slider IS its `<div>` — see `PlainPartProps` for what that gives up (`as`, `base`, motion).
export interface SliderProps extends PlainPartProps<'div'> {
	/**
	 * Current slider value. Supports two-way binding with bind:value.
	 * @default 0
	 */
	value?: number;
	// Default: 0.
	/**
	 * Minimum allowed value.
	 * @default 0
	 */
	min?: number;
	// Default: 100.
	/**
	 * Maximum allowed value.
	 * @default 100
	 */
	max?: number;
	// Step increment. Default: 1.
	/**
	 * Step interval between valid values. Values <= 0 are normalized to 1.
	 * @default 1
	 */
	step?: number;
	/**
	 * Disables pointer and keyboard interaction.
	 * @default false
	 */
	disabled?: boolean;
	// Forwarded to the hidden input.
	/** Forwarded to the hidden native range input, useful with labels and forms. */
	id?: string;
	// Forwarded to the hidden input.
	/** Form field name forwarded to the hidden native range input. */
	name?: string;
	// Default: `'horizontal'`.
	/** Slider direction. Vertical mode is useful for volume, brightness, or timeline controls. */
	orientation?: 'horizontal' | 'vertical';
	// Custom thumb snippet; replaces the default circular thumb; receives `{ value, percent }`.
	/** Custom thumb renderer. Receives value and percent. */
	thumbContent?: Snippet<[SliderThumbContentProps]>;
	// Custom track snippet; replaces the default track + fill bar; receives resolved `props`.
	/** Custom track renderer. Receives value, percent, min, and max. */
	trackContent?: Snippet<[SliderTrackContentProps]>;
	/** Per-instance presentation overrides for compound slots. */
	presets?: SliderPresets;
	// Child content (e.g. label rendered after the slider root).
	/** Optional content rendered after the slider root, for labels, helper text, or value output. */
	children?: Snippet<[]>;
	// Semantic state callback; runs once for each committed value transition.
	/** Semantic callback fired after each value commit. Receives `(value, { event, percent, min, max, step, type })`. */
	onvaluechange?: SliderValueChangeCallback;
	// Native DOM callbacks retain their event-only signatures.
	/** Native change-event callback. Receives only the DOM event. */
	onchange?: (event: Event) => void;
	/** Native input-event callback. Receives only the DOM event. */
	oninput?: (event: Event) => void;
}
