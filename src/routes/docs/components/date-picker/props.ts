import { renderPropsRow, type PropDefinition } from '$docs/types';

export const datePickerCalendarProps: PropDefinition[] = [
	{
		name: 'body',
		type: 'ComponentBase',
		default: 'undefined',
		description: 'Replaces the day grid.'
	},
	{
		name: 'day',
		type: 'ComponentBase',
		default: 'undefined',
		description: 'Replaces an individual day cell.'
	},
	{
		name: 'header',
		type: 'ComponentBase',
		default: 'undefined',
		description: 'Replaces the calendar header (month and year controls).'
	},
	{
		name: 'months',
		type: 'ComponentBase',
		default: 'undefined',
		description: 'Replaces the month-picker view.'
	},
	{
		name: 'weekdays',
		type: 'ComponentBase',
		default: 'undefined',
		description: 'Replaces the weekday name row.'
	},
	{
		name: 'years',
		type: 'ComponentBase',
		default: 'undefined',
		description: 'Replaces the year-picker view.'
	},
	renderPropsRow
];

export const datePickerRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'DatePickerChildren',
		default: 'undefined',
		description: 'Compose Trigger + Calendar inside Root.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'end',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Last day of the selected range. Omit for single-day selection.'
	},
	{
		name: 'factory',
		type: 'Factory<DatePickerBond>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'format',
		type: 'string',
		default: 'undefined',
		description: 'Date format string used for the trigger’s displayed text.'
	},
	{
		name: 'max',
		type: 'Date',
		default: 'undefined',
		description: 'Highest accepted value. Values above it are rejected.'
	},
	{
		name: 'min',
		type: 'Date',
		default: 'undefined',
		description: 'Lowest accepted value. Values below it are rejected.'
	},
	{
		name: 'offset',
		type: 'number',
		default: '2',
		description: 'Pixel gap between the trigger and the calendar popover.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, DatePickerBond>',
		default: 'undefined',
		description: 'Fired after open state commits.'
	},
	{
		name: 'onpivotechange',
		type: 'StateChangeCallback<Date, DatePickerBond>',
		default: 'undefined',
		description: 'Fired after the visible month pivote commits.'
	},
	{
		name: 'onrangechange',
		type: 'StateChangeCallback<CalendarRange, DatePickerBond>',
		default: 'undefined',
		description: 'Fired after the selected range commits in range mode.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<Date | undefined, DatePickerBond>',
		default: 'undefined',
		description: 'Fired after the selected date commits in single mode.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'undefined',
		description: 'Bindable open state of the picker popover.'
	},
	{
		name: 'pivote',
		type: 'Date',
		default: 'new Date()',
		description: 'The month currently in view (bindable).'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'placement',
		type: 'Placement',
		default: 'undefined',
		description: 'Preferred placement of the calendar popover relative to the trigger.'
	},
	{
		name: 'placements',
		type: 'Placement[]',
		default: 'undefined',
		description: 'Fallback placements tried in order when the preferred `placement` does not fit.'
	},
	{
		name: 'presets',
		type: 'DatePickerPresets | undefined',
		default: 'undefined',
		description: "Per-instance presentation overrides for DatePicker's parts."
	},
	{
		name: 'range',
		type: 'CalendarRange',
		default: '[undefined, undefined]',
		description: 'Tuple form of the range bounds (bindable).'
	},
	{
		name: 'start',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'First day of the selected range, or the single selected day.'
	},
	{
		name: 'type',
		type: '"range" | "single"',
		default: 'undefined',
		description: 'Selection mode: pick a single date or a date range.'
	},
	{
		name: 'value',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Selected date in `single` mode (bindable).'
	}
];

export const datePickerHeaderProps: PropDefinition[] = [renderPropsRow];

export const datePickerMonthsProps: PropDefinition[] = [renderPropsRow];

export const datePickerYearsProps: PropDefinition[] = [renderPropsRow];
