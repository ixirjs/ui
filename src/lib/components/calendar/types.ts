import type { Snippet } from 'svelte';
import type { SnippetProps } from '$ixirjs/ui/authoring';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { CalendarBond } from './bond.svelte';
import type { PresetKey } from '$ixirjs/ui/preset';

export type Day = {
	id: number;
	date: Date;
	dayOfMonth: number;
	offmonth: boolean;
	today: boolean;
	week: number;
	month: number;
	disabled: boolean;
	weekend: boolean;
	name: string;
	fullname: string;

	readonly fromNextMonth: boolean;
	readonly fromPreviousMonth: boolean;
};

export type Month = {
	name: string;
	fullname: string;
	start: Date;
	end: Date | undefined;
	days: Day[];
};
export type CalendarRange = [Date | undefined, Date | undefined];

// Snippet props

export interface CalendarSnippetProps extends SnippetProps {
	calendar: CalendarBond;
}

export type CalendarChildren = Snippet<[CalendarSnippetProps]>;

export interface CalendarRootProps {
	/** Additional classes, merged after the preset so they win. */
	class?: string;
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;

	/** Selected date in `single` mode (bindable). */
	value?: Date | undefined;
	/**
	 * Range bounds in `range` mode (bindable tuple).
	 * @default [undefined, undefined]
	 */
	range?: CalendarRange;

	/** First day of the selected range, or the single selected day. */
	start?: Date;
	/** Last day of the selected range. Omit for single-day selection. */
	end?: Date;

	/** Lowest accepted value. Values below it are rejected. */
	min?: Date;
	/** Highest accepted value. Values above it are rejected. */
	max?: Date;

	/**
	 * The month currently in view (bindable). Drives Header/Body rendering.
	 * @default new Date()
	 */
	pivote?: Date;

	/** Selection mode: pick a single date or a date range. */
	type?: 'range' | 'single';

	/** Extra capabilities composed onto this Bond at construction. */
	extend?: Record<string, unknown>;

	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: Factory<CalendarBond>;

	/** Fired after the selected date commits in single mode. */
	onvaluechange?: StateChangeCallback<Date | undefined, CalendarBond>;
	/** Fired after the selected range commits in range mode. */
	onrangechange?: StateChangeCallback<CalendarRange, CalendarBond>;
	/** Fired after the visible month pivote commits. */
	onpivotechange?: StateChangeCallback<Date, CalendarBond>;
	// Native DOM callbacks retain event-only semantics.
	/** Native change event, fired when the value is committed. */
	onchange?: (event: Event) => void;

	/** Compose Header + Body (+ Day via Body’s children snippet) inside Root. */
	children?: CalendarChildren;
}

export interface CalendarDayProps {
	/** Additional classes, merged after the preset so they win. */
	class?: string;
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
	/** The day this cell renders, supplied by the calendar grid. */
	day: Day;
	/** HTML tag to render instead of the default. */
	as?: string;
	/** Native click event. */
	onclick?: (event: MouseEvent) => void;
	/** Bound reference to the rendered DOM element. */
	readonly element?: HTMLElement;
	/** Content of this part. */
	children?: CalendarChildren;
}
