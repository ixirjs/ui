// Types for the input/time sub-module.

import type { StateChangeCallback } from '$ixirjs/ui/types';

export interface SegmentProps {
	value?: number | undefined;
	min: number;
	max: number;
	digits?: number;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	// Native contenteditable callbacks remain event-only.
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: StateChangeCallback<number | undefined>;
	onfocusmove?: (dir: -1 | 1) => void;
	// Fired when ArrowUp/Down wraps past min/max.
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
export type LooseParts<T> = { [K in keyof T]: number | undefined };
