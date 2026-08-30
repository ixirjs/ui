import { renderPropsRow, type PropDefinition } from '$docs/types';

export const cardRootProps: PropDefinition[] = [
	{
		name: 'clickable',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the card as an interactive surface — hover and focus affordances, and a `button` role when no other element supplies one.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disable the card, preventing interaction when clickable'
	},
	{
		name: 'factory',
		type: 'Factory<CardBond>',
		default: 'undefined',
		description: 'Custom factory for the card bond, enabling advanced behavioral customization'
	},
	{
		name: 'onclick',
		type: '(event: MouseEvent) => void',
		default: 'undefined',
		description:
			'Click handler. When provided, the card becomes interactive/clickable with appropriate styling.'
	},
	{
		name: 'onkeydown',
		type: '(event: KeyboardEvent) => void',
		default: 'undefined',
		description: 'Keyboard event handler for accessible card interaction'
	},
	renderPropsRow
];

export const cardHeaderProps: PropDefinition[] = [renderPropsRow];

export const cardBodyProps: PropDefinition[] = [renderPropsRow];

export const cardFooterProps: PropDefinition[] = [renderPropsRow];

export const cardTitleProps: PropDefinition[] = [renderPropsRow];

export const cardSubtitleProps: PropDefinition[] = [renderPropsRow];

export const cardDescriptionProps: PropDefinition[] = [renderPropsRow];

export const cardMediaProps: PropDefinition[] = [renderPropsRow];

export const cardContentProps: PropDefinition[] = [renderPropsRow];
