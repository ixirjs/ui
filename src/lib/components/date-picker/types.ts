import type { Snippet } from 'svelte';
import type { Placement } from '@floating-ui/dom';
import type { ComponentBase, HtmlAtomProps, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Day, CalendarRange } from '$ixirjs/ui/components/calendar/types';
import type { DatePickerBond } from './bond.svelte';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';

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

export interface DatePickerCalendarProps extends HtmlAtomProps<
	'div',
	never,
	Snippet<[{ day: Day }]>
> {
	header?: ComponentBase;
	weekdays?: ComponentBase;
	body?: ComponentBase;
	day?: ComponentBase;
	months?: ComponentBase;
	years?: ComponentBase;
}

export type DatePickerHeaderProps = HtmlAtomProps<'nav'>;
export type DatePickerMonthsProps = HtmlAtomProps<'div'>;
export type DatePickerYearsProps = HtmlAtomProps<'div'>;

export interface DatePickerRootProps {
	open?: boolean;
	value?: Date | undefined;
	range?: CalendarRange;
	pivote?: Date;
	start?: Date | undefined;
	end?: Date | undefined;
	min?: Date;
	max?: Date;
	type?: 'range' | 'single';
	placement?: Placement;
	placements?: Placement[];
	offset?: number;
	disabled?: boolean;
	placeholder?: string;
	format?: string;
	/** Per-instance presentation overrides for DatePicker's parts. */
	presets?: DatePickerPresets | undefined;
	factory?: Factory<DatePickerBond>;
	children?: DatePickerChildren;
	onopenchange?: StateChangeCallback<boolean, DatePickerBond>;
	onvaluechange?: StateChangeCallback<Date | undefined, DatePickerBond>;
	onrangechange?: StateChangeCallback<CalendarRange, DatePickerBond>;
	onpivotechange?: StateChangeCallback<Date, DatePickerBond>;
}
