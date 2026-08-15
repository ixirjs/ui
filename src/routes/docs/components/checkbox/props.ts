import { renderPropsRow, type PropDefinition } from '$docs/types';

export const checkboxProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'false',
		description: 'Whether the checkbox is checked. Supports two-way binding with bind:checked.'
	},
	{
		name: 'checkedContent',
		type: 'Snippet<[]> | Component<{}, {}, string>',
		default: 'undefined',
		description:
			'Custom content to render inside the checkbox when it is checked (e.g., a checkmark icon)'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'group',
		type: 'string[]',
		default: 'undefined',
		description: 'Bindable array for multi-checkbox group management (similar to Svelte bind:group)'
	},
	{
		name: 'id',
		type: 'string',
		default: 'undefined',
		description: 'DOM id. Falls back to one derived from the Bond’s identity seed.'
	},
	{
		name: 'indeterminate',
		type: 'boolean',
		default: 'false',
		description: 'Whether the checkbox is in the indeterminate state (partially selected group)'
	},
	{
		name: 'indeterminateContent',
		type: 'Snippet<[]> | Component<{}, {}, string>',
		default: 'undefined',
		description: 'Custom content to render when the checkbox is in the indeterminate state'
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'Form field name, submitted with the form.'
	},
	{
		name: 'onblur',
		type: '(event: FocusEvent) => void',
		default: 'undefined',
		description: 'Native blur event, fired when the element loses focus.'
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
			'Semantic callback fired after the checked state commits. Receives `(checked, { event })`.'
	},
	{
		name: 'onclick',
		type: '(event: MouseEvent) => void',
		default: 'undefined',
		description: 'Native click event.'
	},
	{
		name: 'onfocus',
		type: '(event: FocusEvent) => void',
		default: 'undefined',
		description: 'Native focus event, fired when the element gains focus.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input-event callback. Receives only the DOM event.'
	},
	{
		name: 'presets',
		type: 'CheckboxPresets',
		default: 'undefined',
		description: 'Per-instance presentation overrides for compound slots.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'The value attribute for group binding. Used alongside the group prop.'
	},
	renderPropsRow
];
