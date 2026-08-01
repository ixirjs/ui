export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const calendarRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Selected date in `single` mode (bindable).'
	},
	{
		name: 'range',
		type: '[Date | undefined, Date | undefined]',
		default: '[undefined, undefined]',
		description: 'Range bounds in `range` mode (bindable tuple).'
	},
	{
		name: 'type',
		type: "'single' | 'range'",
		default: "'single'",
		description: 'Selection mode: pick a single date or a date range.'
	},
	{
		name: 'pivote',
		type: 'Date',
		default: 'new Date()',
		description: 'The month currently in view (bindable). Drives Header/Body rendering.'
	},
	{
		name: 'min / max',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Constrain selectable dates to an inclusive range.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<Date | undefined, CalendarBond> | undefined',
		default: 'undefined',
		description: 'Fired after the selected date commits in single mode.'
	},
	{
		name: 'onrangechange',
		type: 'StateChangeCallback<CalendarRange, CalendarBond> | undefined',
		default: 'undefined',
		description: 'Fired after the selected range commits in range mode.'
	},
	{
		name: 'onpivotechange',
		type: 'StateChangeCallback<Date, CalendarBond> | undefined',
		default: 'undefined',
		description: 'Fired after the visible month pivote commits.'
	},
	{
		name: 'children',
		type: 'Snippet<[CalendarSnippetProps]> | undefined',
		default: 'undefined',
		description: 'Compose Header + Body (+ Day via Body’s children snippet) inside Root.'
	}
];
