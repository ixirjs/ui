import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { InputBond } from '../bond.svelte';
import type { ControlPropsBase } from '../types';
export type ColorFormat =
	| 'named'
	| 'hex'
	| 'rgb'
	| 'hsl'
	| 'hwb'
	| 'lab'
	| 'lch'
	| 'oklab'
	| 'oklch'
	| 'display-p3'
	| 'srgb'
	| 'srgb-linear'
	| 'a98-rgb'
	| 'prophoto-rgb'
	| 'rec2020'
	| 'xyz-d50'
	| 'xyz-d65';

export type ChannelKind =
	| 'integer' // 0–255 integer (rgb channels)
	| 'float' // decimal, typically 0–1
	| 'percent' // 0–100 with % suffix
	| 'angle' // hue, 0–360 with deg suffix
	| 'hex' // two-char hex pair
	| 'alpha' // 0–1 float or 0–100%
	| 'text'; // free-form string (named colors)

export interface ChannelDef {
	id: string;
	label: string;
	kind: ChannelKind;
	min: number;
	max: number;
	precision?: number;
	// Suffix shown after the value (e.g. '%', 'deg')
	suffix?: string;
}

// Parsed channel values keyed by channel id (e.g. `{ r: 'FF', g: '00', b: 'AA' }` for hex,
// `{ h: 210, s: 50, l: 40 }` for hsl). Values are string or number; `undefined` for unset channels.
export type ChannelValues = Record<string, number | string | undefined>;

export interface ColorSegmentProps {
	/** Current value of the control. */
	value: number | string | undefined;
	/** The colour channel this segment edits — its key, range and formatting. */
	channel: ChannelDef;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Renders the current value but blocks editing. Unlike `disabled`, it stays focusable. */
	readonly?: boolean;
	/** Additional classes, merged after the preset so they win. */
	class?: string;
	// Native contenteditable callbacks remain event-only.
	/** Native change event, fired when the value is committed. */
	onchange?: ((event: Event) => void) | undefined;
	/** Native input event, fired on every keystroke. */
	oninput?: ((event: Event) => void) | undefined;
	/** Called when the segment’s value changes. */
	onvaluechange?: StateChangeCallback<number | string | undefined>;
	/** Called when editing of this segment finishes, so the parent can normalise the colour. */
	oncommit?: StateChangeCallback<number | string | undefined>;
	/** Requests focus move to the previous or next segment, driving arrow-key navigation. */
	onfocusmove?: (dir: 1 | -1) => void;
}

export type InputColorControlProps = ControlPropsBase & InputColorControlOwnProps;

export interface InputColorControlOwnProps {
	// Raw CSS color string (bindable); format auto-detected
	/** Bindable CSS color string. */
	value?: string;
	// Override the active format; segments render for this format regardless of value
	/** Override the active format. */
	format?: ColorFormat;
	// Always show the alpha segment even when value has no alpha component
	/**
	 * Always show the alpha channel segment.
	 * @default false
	 */
	alpha?: boolean;
	// Fired after the color value has committed.
	/** Semantic color value callback with event, bond, and reason context. */
	onvaluechange?: StateChangeCallback<string, InputBond>;
}
