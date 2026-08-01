import type { Snippet } from 'svelte';
import type { Placement } from '@floating-ui/dom';
import type { ComponentBase, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Day, CalendarRange } from '../calendar/types';
import type { DatePickerBond } from './bond.svelte';
import type { Factory } from '$svelte-atoms/core/types';

// DatePicker Snippet Props
export interface DatePickerSnippetProps extends SnippetProps {
	datePicker: DatePickerBond;
}

export type DatePickerChildren = Snippet<[DatePickerSnippetProps]>;

export interface DatePickerCalendarProps {
	class?: string;
	preset?: string;
	children?: Snippet<[{ day: Day }]>;
	header?: ComponentBase;
	weekdays?: ComponentBase;
	body?: ComponentBase;
	day?: ComponentBase;
	months?: ComponentBase;
	years?: ComponentBase;
	[key: string]: unknown;
}

export interface DatePickerHeaderProps {
	class?: string;
	preset?: string;
	children?: Snippet;
	[key: string]: unknown;
}

export interface DatePickerMonthsProps {
	class?: string;
	preset?: string;
	children?: Snippet;
	[key: string]: unknown;
}

export interface DatePickerYearsProps {
	class?: string;
	preset?: string;
	children?: Snippet;
	[key: string]: unknown;
}

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
	factory?: Factory<DatePickerBond>;
	children?: DatePickerChildren;
	[key: string]: unknown;
}
