export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const scrollableRootProps: PropDefinition[] = [
	{
		name: 'factory',
		type: 'Factory<ScrollableBond> | undefined',
		default: 'undefined',
		description: 'Custom factory for creating the scrollable bond instance.'
	},
	{
		name: 'scrollX',
		type: 'number | undefined',
		default: '0',
		description: 'Current horizontal scroll position in pixels. Bindable for programmatic control.'
	},
	{
		name: 'scrollY',
		type: 'number | undefined',
		default: '0',
		description: 'Current vertical scroll position in pixels. Bindable for programmatic control.'
	},
	{
		name: 'scrollWidth',
		type: 'number | undefined',
		default: '0',
		description: 'Total scrollable width of the content area in pixels. Read-only via binding.'
	},
	{
		name: 'scrollHeight',
		type: 'number | undefined',
		default: '0',
		description: 'Total scrollable height of the content area in pixels. Read-only via binding.'
	},
	{
		name: 'clientWidth',
		type: 'number | undefined',
		default: '0',
		description: 'Visible width of the scrollable container in pixels. Read-only via binding.'
	},
	{
		name: 'clientHeight',
		type: 'number | undefined',
		default: '0',
		description: 'Visible height of the scrollable container in pixels. Read-only via binding.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disables the scrollbar interaction when true.'
	},
	{
		name: 'open',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Controls whether the scrollbar is visible. Bindable for external control.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ scrollable: ScrollableBond }]> | undefined',
		default: 'undefined',
		description: 'Content renderer receiving the scrollable bond for accessing scroll state.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const scrollableContainerProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Content to render inside the scrollable viewport.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const scrollableContentProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'The inner content that determines the full scrollable size.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const scrollableTrackProps: PropDefinition[] = [
	{
		name: 'orientation',
		type: "'horizontal' | 'vertical'",
		default: '-',
		description: 'Required. Specifies whether this track controls horizontal or vertical scrolling.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const scrollableThumbProps: PropDefinition[] = [
	{
		name: 'orientation',
		type: "'horizontal' | 'vertical'",
		default: '-',
		description: 'Required. Specifies whether this thumb controls horizontal or vertical scrolling.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
