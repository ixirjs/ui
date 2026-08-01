export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const collapsibleRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Whether the collapsible is open. Supports two-way binding with bind:open.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disable the collapsible, preventing user interaction'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const collapsibleHeaderProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'CollapsibleBond',
		default: 'undefined',
		description: 'Bond object passed down from Collapsible.Root for shared component coordination'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | string',
		default: 'undefined',
		description: 'Preset module name for styling'
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

export const collapsibleBodyProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'CollapsibleBond',
		default: 'undefined',
		description: 'Bond object passed down from Collapsible.Root for shared component coordination'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | string',
		default: 'undefined',
		description: 'Preset module name for styling'
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
