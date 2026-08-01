export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const selectItemProps: PropDefinition[] = [
	{
		name: 'preset',
		type: 'string | undefined',
		default: "'select.item'",
		description: 'Preset key for styling'
	},
	{
		name: 'value',
		type: 'string | undefined',
		default: 'nanoid()',
		description: 'The value of the select item'
	},
	{
		name: 'data',
		type: 'T | undefined',
		default: 'undefined',
		description: 'Custom data associated with the item'
	},
	{
		name: 'factory',
		type: '(() => SelectItemController<T>) | undefined',
		default: 'undefined',
		description: 'Factory function to create a custom SelectItemController instance'
	},
	{
		name: 'children',
		type: 'Snippet<[{ selectItem: SelectItemController<T>; }]> | undefined',
		default: 'undefined',
		description: 'Render prop for children'
	}
];

export const selectRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Open'
	},
	{
		name: 'value',
		type: 'T | undefined',
		default: 'undefined',
		description: 'Value'
	},
	{
		name: 'values',
		type: 'T[] | undefined',
		default: 'undefined',
		description: 'Values'
	},
	{
		name: 'label',
		type: 'string | undefined',
		default: "''",
		description: 'Label'
	},
	{
		name: 'labels',
		type: 'string[] | undefined',
		default: "''",
		description: 'Labels'
	},
	{
		name: 'multiple',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Multiple'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disabled'
	},
	{
		name: 'placements',
		type: 'string[] | undefined',
		default: "''",
		description: 'Placements'
	},
	{
		name: 'placement',
		type: 'string | undefined',
		default: "''",
		description: 'Placement'
	},
	{
		name: 'offset',
		type: 'number | undefined',
		default: '0',
		description: 'Offset'
	},
	{
		name: 'keys',
		type: 'string[] | undefined',
		default: "''",
		description: 'Keys'
	},
	{
		name: 'factory',
		type: 'Factory<SelectBond> | undefined',
		default: 'undefined',
		description: 'Factory'
	},
	{
		name: 'children',
		type: 'Snippet<[{ select: SelectBond; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'onquerychange',
		type: '((query: string) => void) | undefined',
		default: "''",
		description: 'Onquerychange'
	}
];

export const selectTriggerProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'ClassValue | undefined',
		default: 'undefined',
		description: 'Class'
	},
	{
		name: 'children',
		type: 'Snippet<[{ selections: SelectSelection[]; selection?: SelectSelection | undefined; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'getSelections',
		type: '(<T extends SelectBond>(bond: T) => SelectSelection[]) | undefined',
		default: 'undefined',
		description: 'Get Selections'
	}
];

export const selectSelectionsProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'ClassValue | undefined',
		default: 'undefined',
		description: 'Class'
	},
	{
		name: 'Selection',
		type: 'Component<{}, {}, string> | undefined',
		default: "''",
		description: 'Selection'
	},
	{
		name: 'children',
		type: 'Snippet<[{ selections: SelectSelection[]; selection?: SelectSelection | undefined; }]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'getSelections',
		type: '(<T extends SelectBond>(bond: T) => SelectSelection[]) | undefined',
		default: 'undefined',
		description: 'Get Selections'
	}
];

export const selectSelectionProps: PropDefinition[] = [
	{
		name: 'selection',
		type: 'SelectSelection',
		default: '-',
		description: 'Selection'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'onclose',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Onclose'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const selectQueryProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string | undefined',
		default: "''",
		description: 'Value'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
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
