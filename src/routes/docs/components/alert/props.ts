import { renderPropsRow, type PropDefinition } from '$docs/types';

export const alertRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disable interaction with the alert (e.g., prevent close button)'
	},
	{
		name: 'extend',
		type: 'Record<string, unknown>',
		default: 'undefined',
		description: 'Extra capabilities composed onto this Bond at construction.'
	},
	{
		name: 'factory',
		type: 'Factory<AlertBondBase>',
		default: 'undefined',
		description: 'Custom factory for the alert bond, enabling advanced behavioral customization'
	},
	renderPropsRow
];

export const alertContentProps: PropDefinition[] = [renderPropsRow];

export const alertTitleProps: PropDefinition[] = [renderPropsRow];

export const alertDescriptionProps: PropDefinition[] = [renderPropsRow];

export const alertIconProps: PropDefinition[] = [renderPropsRow];

export const alertActionsProps: PropDefinition[] = [renderPropsRow];

export const alertCloseButtonProps: PropDefinition[] = [renderPropsRow];
