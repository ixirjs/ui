import { renderPropsRow, type PropDefinition } from '$docs/types';

export const swatchProps: PropDefinition[] = [
	{
		name: 'color',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Any valid CSS color string. Empty string or missing value shows the checkerboard only.'
	},
	renderPropsRow
];
