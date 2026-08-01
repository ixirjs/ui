export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const alertRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disable interaction with the alert (e.g., prevent close button)'
	},
	{
		name: 'factory',
		type: 'Factory<AlertBond> | undefined',
		default: 'undefined',
		description: 'Custom factory for the alert bond, enabling advanced behavioral customization'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const alertSubPartProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'AlertBond',
		default: 'undefined',
		description: 'Bond object passed down from Alert.Root for shared component coordination'
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
