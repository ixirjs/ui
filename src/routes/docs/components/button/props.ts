import { renderPropsRow, type PropDefinition } from '$docs/types';

export const buttonProps: PropDefinition[] = [
	{
		name: 'type',
		type: '"button" | "submit" | "reset"',
		default: 'undefined',
		description: 'Button type attribute for form submission behavior'
	},
	renderPropsRow
];
