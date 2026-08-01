export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const chipProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Label content rendered inside the chip.'
	},
	{
		name: 'ondismiss',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Called when the default close button is clicked.'
	},
	{
		name: 'icon',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Custom icon rendered inside the default close button (replaces the default ✕).'
	},
	{
		name: 'closeButton',
		type: 'Snippet | undefined',
		default: 'undefined',
		description:
			'Fully replace the close button with a custom snippet. When set, `ondismiss`/`icon` no longer apply.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const chipCloseButtonProps: PropDefinition[] = [
	{
		name: 'icon',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Custom icon to render inside the close button.'
	},
	{
		name: 'onclick',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Click handler for the close button.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description: 'Inherited HTML element props. See [Atom Props](/docs/components/atom#props).'
	}
];
