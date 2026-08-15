import { renderPropsRow, type PropDefinition } from '$docs/types';

export const listRootProps: PropDefinition[] = [renderPropsRow];

export const listGroupProps: PropDefinition[] = [renderPropsRow];

export const listItemProps: PropDefinition[] = [renderPropsRow];

export const listTitleProps: PropDefinition[] = [renderPropsRow];

export const listDividerProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'never',
		default: 'undefined',
		description: 'Content of this part.'
	},
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
