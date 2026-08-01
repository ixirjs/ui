import type { Snippet } from 'svelte';
import type { SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { CalendarBond } from './bond.svelte';

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
	class?: string;
	preset?: string;

	value?: Date;
	range?: CalendarRange;

	start?: Date;
	end?: Date;

	min?: Date;
	max?: Date;

	pivote?: Date;

	type?: 'range' | 'single';

	extend?: Record<string, unknown>;

	factory?: Factory<CalendarBond>;

	onchange?: (ev: CustomEvent, params: { range: CalendarRange; pivote: Date }) => void;

	children?: CalendarChildren;
}

export interface CalendarDayProps {
	class?: string;
	preset?: string;
	day: Day;
	as?: string;
	onclick?: () => void;
	readonly element?: HTMLElement;
	children?: CalendarChildren;
}
