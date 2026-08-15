import { renderPropsRow, type PropDefinition } from '$docs/types';

export const switchProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'undefined',
		description: 'On state. Bindable for two-way control.'
	},
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'id',
		type: 'string',
		default: 'undefined',
		description: 'DOM id. Falls back to one derived from the Bond’s identity seed.'
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'Form field name, submitted with the form.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oncheckedchange',
		type: 'StateChangeCallback<boolean, never, MouseEvent>',
		default: 'undefined',
		description: 'Semantic callback; runs after `checked` commits.'
	},
	{
		name: 'onclick',
		type: '(event: MouseEvent) => void',
		default: 'undefined',
		description: 'Native click event.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'presets',
		type: 'SwitchPresets',
		default: 'undefined',
		description: 'Per-instance presentation overrides for compound slots.'
	},
	{
		name: 'thumbContent',
		type: 'Snippet<[SwitchThumbSnippetProps]>',
		default: 'undefined',
		description: 'Replaces the internal thumb while preserving the resolved presentation props.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Current value of the control.'
	},
	renderPropsRow
];
