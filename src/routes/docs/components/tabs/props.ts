export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const tabsRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'D | undefined',
		default: 'undefined',
		description: 'Active tab value'
	},
	{
		name: 'factory',
		type: 'Factory<TabsBond<unknown>> | undefined',
		default: 'undefined',
		description: 'Factory'
	},
	{
		name: 'children',
		type: 'Snippet<[{ tabs: TabsBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<D | undefined, TabsBond> | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after the active value commits. Receives `(value, { bond? })`.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const tabHeaderProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tab?: TabBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const tabBodyProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tab?: TabBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const tabDescriptionProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tab?: TabBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const tabsHeaderProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tabs?: TabsBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const tabsBodyProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tabs?: TabsBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const tabsContentProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tabs?: TabsBond<unknown>; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
