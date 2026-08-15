import { renderPropsRow, type PropDefinition } from '$docs/types';

export const containerProps: PropDefinition[] = [
	{
		name: 'clientHeight',
		type: 'number',
		default: 'undefined',
		description: 'Bound measured content height.'
	},
	{
		name: 'clientWidth',
		type: 'number',
		default: 'undefined',
		description:
			'Bound measured content width. Prefer a CSS `@container` rule where one will do; this is for the cases CSS cannot express.'
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'Form field name, submitted with the form.'
	},
	{
		name: 'type',
		type: '"inline-size" | "size"',
		default: 'undefined',
		description:
			'Containment axis. `inline-size` queries width only — the common case; `size` queries both axes and requires a fixed block size.'
	},
	renderPropsRow
];
