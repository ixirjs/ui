import { renderPropsRow, type PropDefinition } from '$docs/types';

export const comboboxRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'ComboboxChildren',
		default: 'undefined',
		description: 'Combobox content. Receives the ComboboxBond instance for custom composition.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables the combobox, preventing user interaction.'
	},
	{
		name: 'keys',
		type: 'string[]',
		default: 'undefined',
		description:
			'Data keys `filterSelectData` searches. Defaults to every string field on the item.'
	},
	{
		name: 'label',
		type: 'string',
		default: 'undefined',
		description: 'Display label for the currently selected item (single-select mode).'
	},
	{
		name: 'labels',
		type: 'string[]',
		default: 'undefined',
		description: 'Array of display labels for selected items (multi-select mode).'
	},
	{
		name: 'multiple',
		type: 'boolean',
		default: 'false',
		description: 'When true, enables multiple item selection and shows selection chips.'
	},
	{
		name: 'offset',
		type: 'number',
		default: '0',
		description: 'Distance in pixels between the trigger and the dropdown content.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, ComboboxBond>',
		default: 'undefined',
		description: 'Fired after open state commits.'
	},
	{
		name: 'onquerychange',
		type: 'StateChangeCallback<string, ComboboxBond>',
		default: 'undefined',
		description: 'Fired after the filter query commits.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<unknown, ComboboxBond>',
		default: 'undefined',
		description: 'Fired after the selected value commits in single mode.'
	},
	{
		name: 'onvalueschange',
		type: 'StateChangeCallback<unknown[], ComboboxBond>',
		default: 'undefined',
		description: 'Fired after the selected values commit in multiple mode.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description:
			'Controls whether the combobox dropdown is open. Can be bound for controlled usage.'
	},
	{
		name: 'placement',
		type: 'string',
		default: 'undefined',
		description:
			'Preferred placement position for the dropdown content (floating-ui placement value).'
	},
	{
		name: 'placements',
		type: 'string[]',
		default: 'undefined',
		description: 'Ordered list of preferred placement positions for the dropdown content.'
	},
	{
		name: 'presets',
		type: 'ComboboxPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for bonded Combobox parts.'
	},
	{
		name: 'query',
		type: 'string',
		default: 'undefined',
		description:
			'Two-way-bindable search text. Read by `filterSelectData`, cleared by Escape (`ClearThenClose`).'
	},
	{
		name: 'value',
		type: 'unknown',
		default: 'undefined',
		description: 'The currently selected value in single-select mode.'
	},
	{
		name: 'values',
		type: 'unknown[]',
		default: 'undefined',
		description: 'Array of selected values in multi-select mode.'
	}
];

export const comboboxItemProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'ComboboxChildren',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'data',
		type: 'T',
		default: 'undefined',
		description: 'Arbitrary payload carried on the Bond, returned by lookups and snippet props.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Current value of the control.'
	},
	renderPropsRow
];

export const comboboxTriggerProps: PropDefinition[] = [renderPropsRow];

export const comboboxSelectionsProps: PropDefinition[] = [
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

export const comboboxSelectionProps: PropDefinition[] = [
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

export const comboboxControlProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'undefined',
		description: 'Checked state for checkbox/radio inputs'
	},
	{
		name: 'children',
		type: 'InputChildren',
		default: 'undefined',
		description: 'Children content snippet'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValue[]',
		default: 'undefined',
		description: 'CSS class for the input control'
	},
	{
		name: 'date',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Date value for date inputs'
	},
	{
		name: 'files',
		type: 'File[]',
		default: 'undefined',
		description: 'File list for file inputs'
	},
	{
		name: 'number',
		type: 'number',
		default: 'undefined',
		description: 'Number value for number inputs'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change callback. Receives only the DOM event.'
	},
	{
		name: 'oncheckedchange',
		type: 'InputStateChangeCallback<boolean, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for `type="checkbox"` and `type="radio"`.'
	},
	{
		name: 'ondatechange',
		type: 'InputStateChangeCallback<Date | undefined, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for native date/time input types.'
	},
	{
		name: 'onfileschange',
		type: 'InputStateChangeCallback<File[], InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for `type="file"`.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input callback. Receives only the DOM event.'
	},
	{
		name: 'onnumberchange',
		type: 'InputStateChangeCallback<number | undefined, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for `type="number"`.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<unknown, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for the parsed input value.'
	},
	{
		name: 'placeholder',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Placeholder text for the input'
	},
	{
		name: 'type',
		type: 'InputControlType',
		default: 'undefined',
		description: 'HTML input type attribute'
	},
	{
		name: 'value',
		type: 'any',
		default: 'undefined',
		description:
			'The native input value. Parsed number/date/file state uses the dedicated props below.'
	},
	renderPropsRow
];
