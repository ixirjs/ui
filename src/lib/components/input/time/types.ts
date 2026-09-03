// Types for the input/time sub-module.

import type { StateChangeCallback } from '$ixirjs/ui/types';

export interface SegmentProps {
	/** Current value of the control. */
	value?: number | undefined;
	/** Lowest accepted value. Values below it are rejected. */
	min: number;
	/** Highest accepted value. Values above it are rejected. */
	max: number;
	/** Digit width the segment pads to — 2 for hours and minutes. */
	digits?: number;
	/** Hint text shown while the field is empty. */
	placeholder?: string;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Renders the current value but blocks editing. Unlike `disabled`, it stays focusable. */
	readonly?: boolean;
	/** Additional classes, merged after the preset so they win. */
	class?: string;
	// Native contenteditable callbacks remain event-only.
	/** Native change event, fired when the value is committed. */
	onchange?: (event: Event) => void;
	/** Native input event, fired on every keystroke. */
	oninput?: (event: Event) => void;
	/** Called when the segment’s numeric value changes. */
	onvaluechange?: StateChangeCallback<number | undefined>;
	/** Requests focus move to the previous or next segment, driving arrow-key navigation. */
	onfocusmove?: (dir: -1 | 1) => void;
	/** Called when the value wraps past its bound, so the next segment can carry. */
	onrollover?: StateChangeCallback<1 | -1, never, KeyboardEvent>;
}

export interface TimeParts {
	hh?: number;
	mm?: number;
	ss?: number;
	period?: 'AM' | 'PM';
}

export interface DateTimeParts {
	year?: number;
	month?: number;
	day?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
}

// Loose variant for segment semantic callbacks: Segment fires (number | undefined),
// which exactOptionalPropertyTypes rejects as a direct Parts key. Strip undefined before spreading.
// `datetime-control.svelte` is the shared implementation behind both public entry points, so its
// own `mode` covers date as well. The public `InputDateTimeControlProps` stays pinned to
// `'datetime'` and `InputDateControlProps` has no `mode` at all — one component, two names that
// each mean exactly one thing.
export type DateTimeControlImplProps = Omit<
	import('../types').InputDateTimeControlProps,
	'mode'
> & {
	/**
	 * Which segments render. Set by the entry-point component, not by consumers.
	 * @default 'datetime'
	 */
	mode?: 'date' | 'datetime';
};

export type LooseParts<T> = { [K in keyof T]: number | undefined };
