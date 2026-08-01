export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const buttonProps: PropDefinition[] = [
	{
		name: 'type',
		type: '"button" | "submit" | "reset" | undefined',
		default: "'button'",
		description: 'Button type attribute for form submission behavior'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Content to render inside the button'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
