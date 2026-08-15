import { renderPropsRow, type PropDefinition } from '$docs/types';

export const imageProps: PropDefinition[] = [
	{
		name: 'alt',
		type: 'string | undefined',
		default: 'undefined',
		description: "Alternative text. Required for meaningful images; pass `''` for a decorative one."
	},
	{
		name: 'src',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Image URL, forwarded to the underlying element.'
	},
	renderPropsRow
];
