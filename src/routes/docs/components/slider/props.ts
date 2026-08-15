import { renderPropsRow, type PropDefinition } from '$docs/types';

export const sliderThumbContentProps: PropDefinition[] = [
	{
		name: 'percent',
		type: 'number',
		default: 'undefined',
		description: 'The value as a 0–1 fraction of the track, ready for positioning.'
	},
	{
		name: 'props',
		type: 'SliderResolvedPartProps',
		default: 'undefined',
		description:
			'Resolved presentation props for this part — spread them so preset styling survives the override.'
	},
	{
		name: 'value',
		type: 'number',
		default: 'undefined',
		description: 'Current value of the control.'
	}
];

export const sliderTrackContentProps: PropDefinition[] = [
	{
		name: 'max',
		type: 'number',
		default: 'undefined',
		description: 'Highest accepted value. Values above it are rejected.'
	},
	{
		name: 'min',
		type: 'number',
		default: 'undefined',
		description: 'Lowest accepted value. Values below it are rejected.'
	},
	{
		name: 'percent',
		type: 'number',
		default: 'undefined',
		description: 'The value as a 0–1 fraction of the track, ready for positioning.'
	},
	{
		name: 'props',
		type: 'SliderResolvedPartProps',
		default: 'undefined',
		description:
			'Resolved presentation props for this part — spread them so preset styling survives the override.'
	},
	{
		name: 'value',
		type: 'number',
		default: 'undefined',
		description: 'Current value of the control.'
	}
];

export const sliderProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description:
			'Optional content rendered after the slider root, for labels, helper text, or value output.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables pointer and keyboard interaction.'
	},
	{
		name: 'id',
		type: 'string',
		default: 'undefined',
		description: 'Forwarded to the hidden native range input, useful with labels and forms.'
	},
	{
		name: 'max',
		type: 'number',
		default: '100',
		description: 'Maximum allowed value.'
	},
	{
		name: 'min',
		type: 'number',
		default: '0',
		description: 'Minimum allowed value.'
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'Form field name forwarded to the hidden native range input.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change-event callback. Receives only the DOM event.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input-event callback. Receives only the DOM event.'
	},
	{
		name: 'onvaluechange',
		type: 'SliderValueChangeCallback',
		default: 'undefined',
		description:
			'Semantic callback fired after each value commit. Receives `(value, { event, percent, min, max, step, type })`.'
	},
	{
		name: 'orientation',
		type: '"horizontal" | "vertical"',
		default: 'undefined',
		description:
			'Slider direction. Vertical mode is useful for volume, brightness, or timeline controls.'
	},
	{
		name: 'presets',
		type: 'SliderPresets',
		default: 'undefined',
		description: 'Per-instance presentation overrides for compound slots.'
	},
	{
		name: 'step',
		type: 'number',
		default: '1',
		description: 'Step interval between valid values. Values <= 0 are normalized to 1.'
	},
	{
		name: 'thumbContent',
		type: 'Snippet<[SliderThumbContentProps]>',
		default: 'undefined',
		description: 'Custom thumb renderer. Receives value and percent.'
	},
	{
		name: 'trackContent',
		type: 'Snippet<[SliderTrackContentProps]>',
		default: 'undefined',
		description: 'Custom track renderer. Receives value, percent, min, and max.'
	},
	{
		name: 'value',
		type: 'number',
		default: '0',
		description: 'Current slider value. Supports two-way binding with bind:value.'
	},
	renderPropsRow
];
