import { renderPropsRow, type PropDefinition } from '$docs/types';

export const kbdProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'The key label to render inside the kbd element.'
	},
	renderPropsRow
];

export const shortcutProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Custom content — when provided, keys and separator are ignored.'
	},
	{
		name: 'keys',
		type: 'string[]',
		default: 'undefined',
		description: "Keys to render in sequence, e.g. `['⌘', 'K']` or `['Ctrl', 'Shift', 'P']`."
	},
	{
		name: 'separator',
		type: 'string',
		default: 'undefined',
		description: 'Visual separator rendered between keys.'
	},
	renderPropsRow
];
