import { renderPropsRow, type PropDefinition } from '$docs/types';

export const avatarProps: PropDefinition[] = [
	{
		name: 'alt',
		type: 'string',
		default: 'undefined',
		description:
			'Alt text for the image. Also used to generate fallback initials when no image is set.'
	},
	{
		name: 'element',
		type: 'HTMLElement',
		default: 'undefined',
		description: 'Bindable reference to the underlying DOM element'
	},
	{
		name: 'src',
		type: 'string | Component<{}, {}, string>',
		default: 'undefined',
		description: 'Image URL or a Svelte component to render as the avatar image'
	},
	renderPropsRow
];
