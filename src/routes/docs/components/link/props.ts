export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const linkProps: PropDefinition[] = [
	{
		name: 'href',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The URL the link navigates to.'
	},
	{
		name: 'target',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Where to open the linked URL. Use "_blank" for external links.'
	},
	{
		name: 'rel',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Relationship between the current document and the linked URL. Use "noopener noreferrer" for external links.'
	},
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Link text or content rendered inside the anchor element.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
