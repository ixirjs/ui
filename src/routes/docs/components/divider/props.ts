import { renderPropsRow, type PropDefinition } from '$docs/types';

export const dividerProps: PropDefinition[] = [
	{
		name: 'transparent',
		type: 'boolean',
		default: 'false',
		description: 'Transparent'
	},
	{
		name: 'vertical',
		type: 'boolean',
		default: 'false',
		description: 'Vertical'
	},
	renderPropsRow
];
