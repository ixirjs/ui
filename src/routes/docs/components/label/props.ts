import { renderPropsRow, type PropDefinition } from '$docs/types';

export const labelProps: PropDefinition[] = [
	{
		name: 'for',
		type: 'string | null',
		default: 'undefined',
		description:
			'The id of the form element this label is associated with. Maps to the HTML `for` attribute.'
	},
	renderPropsRow
];
