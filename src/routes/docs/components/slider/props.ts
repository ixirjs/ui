export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const sliderProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'number | undefined',
		default: '0',
		description: 'Current slider value. Supports two-way binding with bind:value.'
	},
	{
		name: 'min',
		type: 'number | undefined',
		default: '0',
		description: 'Minimum allowed value.'
	},
	{
		name: 'max',
		type: 'number | undefined',
		default: '100',
		description: 'Maximum allowed value.'
	},
	{
		name: 'step',
		type: 'number | undefined',
		default: '1',
		description: 'Step interval between valid values. Values <= 0 are normalized to 1.'
	},
	{
		name: 'orientation',
		type: "'horizontal' | 'vertical' | undefined",
		default: "'horizontal'",
		description:
			'Slider direction. Vertical mode is useful for volume, brightness, or timeline controls.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disables pointer and keyboard interaction.'
	},
	{
		name: 'id',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Forwarded to the hidden native range input, useful with labels and forms.'
	},
	{
		name: 'name',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Form field name forwarded to the hidden native range input.'
	},
	{
		name: 'thumbContent',
		type: 'Snippet<[{ value: number; percent: number }]> | undefined',
		default: 'undefined',
		description: 'Custom thumb renderer. Receives value and percent.'
	},
	{
		name: 'trackContent',
		type: 'Snippet<[{ value: number; percent: number; min: number; max: number }]> | undefined',
		default: 'undefined',
		description: 'Custom track renderer. Receives value, percent, min, and max.'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description:
			'Optional content rendered after the slider root, for labels, helper text, or value output.'
	},
	{
		name: 'onvaluechange',
		type: 'SliderValueChangeCallback | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after each value commit. Receives `(value, { event, percent, min, max, step, type })`.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native input-event callback. Receives only the DOM event.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native change-event callback. Receives only the DOM event.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for inherited properties.'
	}
];
