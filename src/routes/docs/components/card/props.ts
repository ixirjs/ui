export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const cardRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disable the card, preventing interaction when clickable'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description:
			'Click handler. When provided, the card becomes interactive/clickable with appropriate styling.'
	},
	{
		name: 'onkeydown',
		type: '((event: KeyboardEvent) => void) | undefined',
		default: 'undefined',
		description: 'Keyboard event handler for accessible card interaction'
	},
	{
		name: 'factory',
		type: 'Factory<CardBond> | undefined',
		default: 'undefined',
		description: 'Custom factory for the card bond, enabling advanced behavioral customization'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const cardSubPartProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'CardBond',
		default: 'undefined',
		description: 'Bond object passed down from Card.Root for shared component coordination'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | string',
		default: 'undefined',
		description: 'Preset module name for styling this sub-part'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValue[]',
		default: 'undefined',
		description: 'CSS class(es) to apply'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
