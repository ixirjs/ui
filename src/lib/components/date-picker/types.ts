import type { Snippet } from 'svelte';
import type { Placement } from '@floating-ui/dom';
import type { ComponentBase, RenderProps, SnippetProps } from '$ixirjs/ui/authoring';
import type { Day, CalendarRange } from '$ixirjs/ui/components/calendar/types';
import type { DatePickerBond } from './bond.svelte';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';

// DatePicker Snippet Props
export interface DatePickerSnippetProps extends SnippetProps {
	datePicker: DatePickerBond;
}

export type DatePickerChildren = Snippet<[DatePickerSnippetProps]>;

/** Per-instance presentation layers for DatePicker's composed and static parts. */
export interface DatePickerPresets extends BondPresetLayers {
	trigger?: PresetLike;
	content?: PresetLike;
	overlay?: PresetLike;
	tail?: PresetLike;
	indicator?: PresetLike;
	virtualTrigger?: PresetLike;
	clearButton?: PresetLike;
	calendar?: PresetLike;
	header?: PresetLike;
	weekdays?: PresetLike;
	body?: PresetLike;
	day?: PresetLike;
	months?: PresetLike;
	years?: PresetLike;
}

export interface DatePickerCalendarProps extends RenderProps<
	'div',
	never,
	Snippet<[{ day: Day }]>
> {
	/** Replaces the calendar header (month and year controls). */
	header?: ComponentBase;
	/** Replaces the weekday name row. */
	weekdays?: ComponentBase;
	/** Replaces the day grid. */
	body?: ComponentBase;
	/** Replaces an individual day cell. */
	day?: ComponentBase;
	/** Replaces the month-picker view. */
	months?: ComponentBase;
	/** Replaces the year-picker view. */
	years?: ComponentBase;
}

export type DatePickerHeaderProps = RenderProps<'nav'>;
export type DatePickerMonthsProps = RenderProps<'div'>;
export type DatePickerYearsProps = RenderProps<'div'>;

export interface DatePickerRootProps {
	/** Bindable open state of the picker popover. */
	open?: boolean;
	/** Selected date in `single` mode (bindable). */
	value?: Date | undefined;
	/**
	 * Tuple form of the range bounds (bindable).
	 * @default [undefined, undefined]
	 */
	range?: CalendarRange;
	/**
	 * The month currently in view (bindable).
	 * @default new Date()
	 */
	pivote?: Date;
	/** First day of the selected range, or the single selected day. */
	start?: Date | undefined;
	/** Last day of the selected range. Omit for single-day selection. */
	end?: Date | undefined;
	/** Lowest accepted value. Values below it are rejected. */
	min?: Date;
	/** Highest accepted value. Values above it are rejected. */
	max?: Date;
	/** Selection mode: pick a single date or a date range. */
	type?: 'range' | 'single';
	/** Preferred placement of the calendar popover relative to the trigger. */
	placement?: Placement;
	/** Fallback placements tried in order when the preferred `placement` does not fit. */
	placements?: Placement[];
	/**
	 * Pixel gap between the trigger and the calendar popover.
	 * @default 2
	 */
	offset?: number;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Hint text shown while the field is empty. */
	placeholder?: string;
	/** Date format string used for the trigger’s displayed text. */
	format?: string;
	/** Per-instance presentation overrides for DatePicker's parts. */
	presets?: DatePickerPresets | undefined;
	/** Compose Trigger + Calendar inside Root. */
	children?: DatePickerChildren;
	/** Fired after open state commits. */
	onopenchange?: StateChangeCallback<boolean, DatePickerBond>;
	/** Fired after the selected date commits in single mode. */
	onvaluechange?: StateChangeCallback<Date | undefined, DatePickerBond>;
	/** Fired after the selected range commits in range mode. */
	onrangechange?: StateChangeCallback<CalendarRange, DatePickerBond>;
	/** Fired after the visible month pivote commits. */
	onpivotechange?: StateChangeCallback<Date, DatePickerBond>;
}
