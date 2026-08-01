// Types for the input/time sub-module.

export interface SegmentProps {
	value?: number | undefined;
	min: number;
	max: number;
	digits?: number;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	onchange?: (value: number | undefined) => void;
	onfocusmove?: (dir: -1 | 1) => void;
	// Fired when ArrowUp/Down wraps past min/max.
	onrollover?: (dir: 1 | -1) => void;
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

// Loose variant for segment onchange callbacks: Segment fires (number | undefined),
// which exactOptionalPropertyTypes rejects as a direct Parts key. Strip undefined before spreading.
export type LooseParts<T> = { [K in keyof T]: number | undefined };
