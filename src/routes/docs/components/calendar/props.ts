import type { PropDefinition } from '$docs/types';

export const calendarRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'CalendarChildren',
		default: 'undefined',
		description: 'Compose Header + Body (+ Day via Body’s children snippet) inside Root.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'end',
		type: 'Date',
		default: 'undefined',
		description: 'Last day of the selected range. Omit for single-day selection.'
	},
	{
		name: 'extend',
		type: 'Record<string, unknown>',
		default: 'undefined',
		description: 'Extra capabilities composed onto this Bond at construction.'
	},
	{
		name: 'factory',
		type: 'Factory<CalendarBondBase>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
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
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'onpivotechange',
		type: 'StateChangeCallback<Date, CalendarBondBase>',
		default: 'undefined',
		description: 'Fired after the visible month pivote commits.'
	},
	{
		name: 'onrangechange',
		type: 'StateChangeCallback<CalendarRange, CalendarBondBase>',
		default: 'undefined',
		description: 'Fired after the selected range commits in range mode.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<Date | undefined, CalendarBondBase>',
		default: 'undefined',
		description: 'Fired after the selected date commits in single mode.'
	},
	{
		name: 'pivote',
		type: 'Date',
		default: 'new Date()',
		description: 'The month currently in view (bindable). Drives Header/Body rendering.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'range',
		type: 'CalendarRange',
		default: '[undefined, undefined]',
		description: 'Range bounds in `range` mode (bindable tuple).'
	},
	{
		name: 'start',
		type: 'Date',
		default: 'undefined',
		description: 'First day of the selected range, or the single selected day.'
	},
	{
		name: 'type',
		type: '"single" | "range"',
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

export const calendarDayProps: PropDefinition[] = [
	{
		name: 'as',
		type: 'string',
		default: 'undefined',
		description: 'HTML tag to render instead of the default.'
	},
	{
		name: 'children',
		type: 'CalendarChildren',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'day',
		type: 'Day',
		default: 'undefined',
		description: 'The day this cell renders, supplied by the calendar grid.'
	},
	{
		name: 'element',
		type: 'HTMLElement',
		default: 'undefined',
		description: 'Bound reference to the rendered DOM element.'
	},
	{
		name: 'onclick',
		type: '(event: MouseEvent) => void',
		default: 'undefined',
		description: 'Native click event.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	}
];
