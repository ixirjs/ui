export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const listRootProps: PropDefinition[] = [
	{
		name: 'as',
		type: "'ul' | 'ol' | string",
		default: "'ul'",
		description:
			'The HTML element to render as. Use "ol" for ordered lists and "ul" for unordered lists.'
	},
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'List content, typically List.Item, List.Group, or List.Divider components.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const listGroupProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Group content, typically List.Title and List.Item components.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const listItemProps: PropDefinition[] = [
	{
		name: 'as',
		type: "'li' | string",
		default: "'li'",
		description: 'The HTML element to render as.'
	},
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Item content. Can include icons, text, and action elements.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const listTitleProps: PropDefinition[] = [
	{
		name: 'as',
		type: "'h3' | string",
		default: "'h3'",
		description: 'The HTML heading element to render as.'
	},
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Title text or content for the group section.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const listDividerProps: PropDefinition[] = [
	{
		name: 'vertical',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether to render a vertical divider instead of the default horizontal one.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
