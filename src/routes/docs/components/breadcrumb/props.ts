import { renderPropsRow, type PropDefinition } from '$docs/types';

export const breadcrumbItemProps: PropDefinition[] = [
	{
		name: 'href',
		type: 'string',
		default: 'undefined',
		description: 'Link URL. Omit for the current (non-linked) page item.'
	},
	renderPropsRow
];

export const breadcrumbRootProps: PropDefinition[] = [renderPropsRow];

export const breadcrumbSeparatorProps: PropDefinition[] = [renderPropsRow];
