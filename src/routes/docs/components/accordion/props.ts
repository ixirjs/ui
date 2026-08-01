export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const accordionRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The value of the currently open item (controlled single-item mode)'
	},
	{
		name: 'values',
		type: 'string[] | undefined',
		default: 'undefined',
		description: 'Array of currently open item values (controlled multiple-item mode)'
	},
	{
		name: 'multiple',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Allow multiple accordion items to be open simultaneously'
	},
	{
		name: 'collapsible',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Allow all items to be collapsed (no forced-open item)'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disable all accordion items'
	},
	{
		name: 'factory',
		type: 'Factory<AccordionBond> | undefined',
		default: 'undefined',
		description: 'Custom factory for the accordion bond, enabling advanced behavioral customization'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const accordionItemRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Unique identifier for this accordion item. Used to control open state programmatically.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disable this accordion item individually'
	},
	{
		name: 'factory',
		type: 'Factory<AccordionItemBond> | undefined',
		default: 'undefined',
		description: 'Custom factory for the item bond, enabling advanced behavioral customization'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const accordionItemHeaderProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'AccordionItemBond',
		default: 'undefined',
		description: 'Bond object passed down from AccordionItem.Root for shared item coordination'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | string',
		default: 'undefined',
		description: 'Preset module name for styling this header'
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

export const accordionItemBodyProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'AccordionItemBond',
		default: 'undefined',
		description: 'Bond object passed down from AccordionItem.Root for shared item coordination'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | string',
		default: 'undefined',
		description: 'Preset module name for styling this body'
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

export const accordionItemIndicatorProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'AccordionItemBond',
		default: 'undefined',
		description: 'Bond object passed down from AccordionItem.Root for shared item coordination'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | string',
		default: 'undefined',
		description: 'Preset module name for styling this indicator'
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
