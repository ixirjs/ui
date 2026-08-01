import type { PresetKey } from '$ixirjs/ui/preset';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { InputBond } from '$ixirjs/ui/components/input/bond.svelte';
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
	value: number | string | undefined;
	channel: ChannelDef;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	// Native contenteditable callbacks remain event-only.
	onchange?: ((event: Event) => void) | undefined;
	oninput?: ((event: Event) => void) | undefined;
	// Fired on every live semantic change (arrow up/down, typing).
	onvaluechange?: StateChangeCallback<number | string | undefined>;
	// Fired on blur / Enter after the value commits.
	oncommit?: StateChangeCallback<number | string | undefined>;
	onfocusmove?: (dir: 1 | -1) => void;
}

export interface InputColorControlProps {
	// Raw CSS color string (bindable); format auto-detected
	value?: string;
	// Override the active format; segments render for this format regardless of value
	format?: ColorFormat;
	// Always show the alpha segment even when value has no alpha component
	alpha?: boolean;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	// Native DOM callbacks retain event-only semantics.
	oninput?: (event: Event) => void;
	onchange?: (event: Event) => void;
	// Fired after the color value has committed.
	onvaluechange?: StateChangeCallback<string, InputBond>;
}
