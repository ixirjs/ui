export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const datePickerRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Selected date in `single` mode (bindable).'
	},
	{
		name: 'type',
		type: "'single' | 'range'",
		default: "'single'",
		description: 'Selection mode: pick a single date or a date range.'
	},
	{
		name: 'start / end',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Range bounds in `range` mode (bindable).'
	},
	{
		name: 'range',
		type: '[Date | undefined, Date | undefined]',
		default: '[undefined, undefined]',
		description: 'Tuple form of the range bounds (bindable).'
	},
	{
		name: 'pivote',
		type: 'Date',
		default: 'new Date()',
		description: 'The month currently in view (bindable).'
	},
	{
		name: 'min / max',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Constrain selectable dates to an inclusive range.'
	},
	{
		name: 'placement',
		type: 'Placement',
		default: "'bottom-start'",
		description: 'Preferred placement of the calendar popover relative to the trigger.'
	},
	{
		name: 'offset',
		type: 'number',
		default: '2',
		description: 'Pixel gap between the trigger and the calendar popover.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, DatePickerBond> | undefined',
		default: 'undefined',
		description: 'Fired after open state commits.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<Date | undefined, DatePickerBond> | undefined',
		default: 'undefined',
		description: 'Fired after the selected date commits in single mode.'
	},
	{
		name: 'onrangechange',
		type: 'StateChangeCallback<CalendarRange, DatePickerBond> | undefined',
		default: 'undefined',
		description: 'Fired after the selected range commits in range mode.'
	},
	{
		name: 'onpivotechange',
		type: 'StateChangeCallback<Date, DatePickerBond> | undefined',
		default: 'undefined',
		description: 'Fired after the visible month pivote commits.'
	},
	{
		name: 'children',
		type: 'Snippet<[DatePickerSnippetProps]> | undefined',
		default: 'undefined',
		description: 'Compose Trigger + Calendar inside Root.'
	}
];
