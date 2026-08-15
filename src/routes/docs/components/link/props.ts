import { renderPropsRow, type PropDefinition } from '$docs/types';

export const linkProps: PropDefinition[] = [
	{
		name: 'href',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The URL the link navigates to.'
	},
	{
		name: 'rel',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Relationship between the current document and the linked URL. Use "noopener noreferrer" for external links.'
	},
	{
		name: 'target',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Where to open the linked URL. Use "_blank" for external links.'
	},
	renderPropsRow
];
