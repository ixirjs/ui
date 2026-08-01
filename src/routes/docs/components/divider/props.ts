export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const dividerProps: PropDefinition[] = [
	{
		name: 'vertical',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Vertical'
	},
	{
		name: 'transparent',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Transparent'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
