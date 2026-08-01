export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const avatarProps: PropDefinition[] = [
	{
		name: 'src',
		type: 'string | Component | undefined',
		default: 'undefined',
		description: 'Image URL or a Svelte component to render as the avatar image'
	},
	{
		name: 'alt',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Alt text for the image. Also used to generate fallback initials when no image is set.'
	},
	{
		name: 'element',
		type: 'HTMLElement | undefined',
		default: 'undefined',
		description: 'Bindable reference to the underlying DOM element'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
