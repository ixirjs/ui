export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const labelProps: PropDefinition[] = [
	{
		name: 'for',
		type: 'string | null | undefined',
		default: 'undefined',
		description:
			'The id of the form element this label is associated with. Maps to the HTML `for` attribute.'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Label text or rich content rendered inside the label element.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
