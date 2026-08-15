import { renderPropsRow, type PropDefinition } from '$docs/types';

export const radioProps: PropDefinition[] = [
	{
		name: 'checkedContent',
		type: 'Snippet<[]> | Component<{}, {}, string>',
		default: 'undefined',
		description:
			'Custom component or snippet rendered in place of the default indicator when the radio is checked.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Whether the radio button is disabled and non-interactive.'
	},
	{
		name: 'group',
		type: 'T',
		default: 'undefined',
		description: 'The currently selected value. The radio is checked when `group === value`.'
	},
	{
		name: 'id',
		type: 'string',
		default: 'undefined',
		description: 'The id attribute of the radio input element, used for label association.'
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'The name attribute of the radio input, groups radios for form submission.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change-event callback. Receives only the DOM event.'
	},
	{
		name: 'oncheckedchange',
		type: 'StateChangeCallback<boolean>',
		default: 'undefined',
		description:
			'Semantic callback fired after this item’s checked state commits for both selection and deselection. The context includes `event` when the native event is available.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input-event callback. Receives only the DOM event.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description: 'Whether the radio button value is readonly and cannot be changed by the user.'
	},
	{
		name: 'required',
		type: 'boolean',
		default: 'false',
		description: 'Whether the radio button is required to be selected for form validation.'
	},
	{
		name: 'value',
		type: 'T',
		default: 'undefined',
		description:
			'The value this radio button represents. Compared against `group` to determine the checked state.'
	},
	renderPropsRow
];

export const radioGroupProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables all radio buttons in the group.'
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'The shared name attribute applied to all radio buttons in the group.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native callback for change events bubbling from radio items.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native callback for input events bubbling from radio items.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<T>',
		default: 'undefined',
		description:
			'Semantic callback fired after the selected group value commits. Receives `(value, { event })` with the native item event.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description: 'Makes all radio buttons in the group readonly.'
	},
	{
		name: 'required',
		type: 'boolean',
		default: 'false',
		description: 'Marks all radio buttons in the group as required.'
	},
	{
		name: 'value',
		type: 'T',
		default: 'undefined',
		description: 'The currently selected value in the group. Bindable for two-way synchronization.'
	},
	renderPropsRow
];
