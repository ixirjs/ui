import { renderPropsRow, type PropDefinition } from '$docs/types';

export const progressLinearProps: PropDefinition[] = [
	{
		name: 'max',
		type: 'number',
		default: '100',
		description: 'Maximum value used to compute the percentage.'
	},
	{
		name: 'value',
		type: 'number | null',
		default: 'null',
		description: 'Current progress value (0–max). Set to `null` for indeterminate state.'
	},
	renderPropsRow
];

export const progressCircularProps: PropDefinition[] = [
	{
		name: 'max',
		type: 'number',
		default: '100',
		description: 'Maximum value used to compute the percentage.'
	},
	{
		name: 'value',
		type: 'number | null',
		default: 'null',
		description: 'Current progress value (0–max). Set to `null` for indeterminate state.'
	},
	renderPropsRow
];
