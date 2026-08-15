import { renderPropsRow, type PropDefinition } from '$docs/types';

export const chipProps: PropDefinition[] = [
	{
		name: 'closeButton',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description:
			'Fully replace the close button with a custom snippet. When set, `ondismiss`/`icon` no longer apply.'
	},
	{
		name: 'icon',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Custom icon rendered inside the default close button (replaces the default ✕).'
	},
	{
		name: 'ondismiss',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Called when the default close button is clicked.'
	},
	renderPropsRow
];

export const chipCloseButtonProps: PropDefinition[] = [
	{
		name: 'icon',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Custom icon to render inside the close button.'
	},
	{
		name: 'onclick',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Click handler for the close button.'
	},
	renderPropsRow
];
