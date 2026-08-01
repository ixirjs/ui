export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const stackRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Bindable. Reflects the id of the topmost (most recently raised) Stack.Item. Updates reactively as z-order changes.'
	},
	{
		name: 'factory',
		type: '(props) => StackBond',
		default: 'built-in',
		description: 'Custom factory for creating the StackBond instance.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const stackItemProps: PropDefinition[] = [
	{
		name: 'id',
		type: 'string',
		default: '$props.id()',
		description:
			'Unique identifier for this item within the stack. Used by Bond z-order methods such as bringToFront and sendToBack. Auto-generated if omitted.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
