import type { Snippet } from 'svelte';
import type { SnippetProps } from '$ixirjs/ui/components/atom';
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
	class?: string;
	preset?: PresetKey;

	value?: Date | undefined;
	range?: CalendarRange;

	start?: Date;
	end?: Date;

	min?: Date;
	max?: Date;

	pivote?: Date;

	type?: 'range' | 'single';

	extend?: Record<string, unknown>;

	factory?: Factory<CalendarBond>;

	onvaluechange?: StateChangeCallback<Date | undefined, CalendarBond>;
	onrangechange?: StateChangeCallback<CalendarRange, CalendarBond>;
	onpivotechange?: StateChangeCallback<Date, CalendarBond>;
	// Native DOM callbacks retain event-only semantics.
	onchange?: (event: Event) => void;

	children?: CalendarChildren;
}

export interface CalendarDayProps {
	class?: string;
	preset?: PresetKey;
	day: Day;
	as?: string;
	onclick?: (event: MouseEvent) => void;
	readonly element?: HTMLElement;
	children?: CalendarChildren;
}
