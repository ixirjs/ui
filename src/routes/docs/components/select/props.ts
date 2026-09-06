import { renderPropsRow, type PropDefinition } from '$docs/types';

export const selectItemProps: PropDefinition[] = [
	{
		name: 'animate',
		type: '(this: DropdownMenuItemAtom) => void | (() => void)',
		default: 'undefined',
		description: 'Animation configuration'
	},
	{
		name: 'children',
		type: 'Snippet<[{ selectItem: SelectItemController<T>; }]>',
		default: 'undefined',
		description: 'Render prop for children'
	},
	{
		name: 'class',
		type: 'ClassValue',
		default: 'undefined',
		description: 'Custom CSS class(es) to apply to the dropdown menu item'
	},
	{
		name: 'data',
		type: 'T',
		default: 'undefined',
		description: 'Custom data associated with the item'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the item.'
	},
	{
		name: 'enter',
		type: '(this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void',
		default: 'undefined',
		description: 'Transition function for entering'
	},
	{
		name: 'exit',
		type: '(this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void',
		default: 'undefined',
		description: 'Transition function for exiting'
	},
	{
		name: 'id',
		type: 'string',
		default: 'generated id',
		description: 'Stable item identity used by roving focus.'
	},
	{
		name: 'initial',
		type: '(this: DropdownMenuItemAtom) => void | (() => void)',
		default: 'undefined',
		description: 'Initial state configuration'
	},
	{
		name: 'onclick',
		type: '(event: MouseEvent) => void',
		default: 'undefined',
		description: 'Native click callback. Call event.preventDefault() to keep the menu open.'
	},
	{
		name: 'ondestroy',
		type: '(this: DropdownMenuItemAtom) => void',
		default: 'undefined',
		description: 'Function called when element is destroyed'
	},
	{
		name: 'onmount',
		type: '(this: DropdownMenuItemAtom) => void',
		default: 'undefined',
		description: 'Function called when element is mounted'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key for styling'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'The value of the select item'
	},
	renderPropsRow
];

export const selectRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'SelectChildren',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disabled'
	},
	{
		name: 'keys',
		type: 'string[]',
		default: 'undefined',
		description: 'Keys'
	},
	{
		name: 'label',
		type: 'string',
		default: 'undefined',
		description: 'Label'
	},
	{
		name: 'labels',
		type: 'string[]',
		default: 'undefined',
		description: 'Labels'
	},
	{
		name: 'multiple',
		type: 'boolean',
		default: 'false',
		description: 'Multiple'
	},
	{
		name: 'offset',
		type: 'number',
		default: '0',
		description: 'Offset'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, SelectBond>',
		default: 'undefined',
		description: 'Fired after open state commits.'
	},
	{
		name: 'onquerychange',
		type: 'StateChangeCallback<string, SelectBond>',
		default: 'undefined',
		description: 'Fired after the filter query commits.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<T | undefined, SelectBond>',
		default: 'undefined',
		description: 'Fired after the selected value commits in single mode.'
	},
	{
		name: 'onvalueschange',
		type: 'StateChangeCallback<T[], SelectBond>',
		default: 'undefined',
		description: 'Fired after the selected values commit in multiple mode.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Open'
	},
	{
		name: 'optionLabel',
		type: '(option: Option, index: number) => string',
		default: 'undefined',
		description: 'Display and typeahead text per option.'
	},
	{
		name: 'options',
		type: 'readonly Option[]',
		default: 'undefined',
		description:
			'The full ordered option data. Supplying it moves roving, typeahead and selected-label resolution off the mounted Collection and onto the data — so you can window the list yourself with `createVirtual` inside `Select.Content` and still navigate, search and label options that were never mounted. Omit it and Select behaves as before.'
	},
	{
		name: 'optionValue',
		type: '(option: Option, index: number) => string',
		default: 'undefined',
		description: 'Stable, unique value per option. Required alongside `options`.'
	},
	{
		name: 'placement',
		type: 'string',
		default: 'undefined',
		description: 'Placement'
	},
	{
		name: 'placements',
		type: 'string[]',
		default: 'undefined',
		description: 'Placements'
	},
	{
		name: 'presets',
		type: 'SelectPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for bonded Select parts.'
	},
	{
		name: 'query',
		type: 'string',
		default: 'undefined',
		description:
			'Two-way-bindable filter text. Read by `filterSelectData`, cleared by Escape (`ClearThenClose`).'
	},
	{
		name: 'value',
		type: 'T',
		default: 'undefined',
		description: 'Value'
	},
	{
		name: 'values',
		type: 'T[]',
		default: 'undefined',
		description: 'Values'
	}
];

export const selectTriggerProps: PropDefinition[] = [renderPropsRow];

export const selectSelectionsProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ selections: SelectSelection[]; selection?: SelectSelection | undefined; }]>',
		default: 'undefined',
		description: 'Children content snippet'
	},
	{
		name: 'class',
		type: 'ClassValue',
		default: 'undefined',
		description: 'CSS class for the selections container'
	},
	{
		name: 'getSelections',
		type: '<T extends SelectBond>(bond: T) => SelectSelection[]',
		default: 'undefined',
		description: 'Custom function to retrieve selections from the bond'
	},
	{
		name: 'Selection',
		type: 'Component<{}, {}, string> | undefined',
		default: 'undefined',
		description: 'Replaces the component rendering each selected item.'
	}
];

export const selectSelectionProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Children content snippet'
	},
	{
		name: 'ondismiss',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Callback fired when the selection is closed/removed'
	},
	{
		name: 'selection',
		type: 'SelectSelection',
		default: 'undefined',
		description: 'Selection object containing id, value, label, and unselect function (required)'
	},
	renderPropsRow
];

export const selectQueryProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Value'
	},
	renderPropsRow
];
