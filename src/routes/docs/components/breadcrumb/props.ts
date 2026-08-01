export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

const breadcrumbProps = {
	root: [
		{
			name: 'as',
			type: 'string',
			default: "'div'",
			description: 'HTML element type to render as'
		},
		{
			name: '...atomProps',
			type: 'HtmlAtomProps',
			default: '-',
			description:
				'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
		}
	] as PropDefinition[],
	item: [
		{
			name: 'href',
			type: 'string | undefined',
			default: 'undefined',
			description: 'Link URL. Omit for the current (non-linked) page item.'
		},
		{
			name: 'as',
			type: 'string',
			default: "'a'",
			description: 'HTML element type to render as'
		},
		{
			name: '...atomProps',
			type: 'HtmlAtomProps',
			default: '-',
			description:
				'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
		}
	] as PropDefinition[],
	separator: [
		{
			name: 'as',
			type: 'string',
			default: "'span'",
			description: 'HTML element type to render as'
		},
		{
			name: '...atomProps',
			type: 'HtmlAtomProps',
			default: '-',
			description:
				'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
		}
	] as PropDefinition[]
};

export default breadcrumbProps;
