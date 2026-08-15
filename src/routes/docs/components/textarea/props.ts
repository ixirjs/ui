import { renderPropsRow, type PropDefinition } from '$docs/types';

export const textareaRootProps: PropDefinition[] = [renderPropsRow];

export const textareaInputProps: PropDefinition[] = [
	{
		name: 'autocomplete',
		type: 'string',
		default: 'undefined',
		description:
			'Browser autocomplete hint. Use "on", "off", or a specific token like "street-address".'
	},
	{
		name: 'autofocus',
		type: 'boolean',
		default: 'false',
		description: 'Whether the textarea should receive focus automatically when the page loads.'
	},
	{
		name: 'autoResize',
		type: 'boolean',
		default: 'undefined',
		description: 'Grows the textarea to fit its content instead of scrolling.'
	},
	{
		name: 'cols',
		type: 'number',
		default: 'undefined',
		description: 'Number of visible text columns. Determines the initial width of the textarea.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables the textarea, preventing user input and applying disabled styling.'
	},
	{
		name: 'maxlength',
		type: 'number',
		default: 'undefined',
		description: 'Maximum number of characters allowed in the textarea.'
	},
	{
		name: 'minlength',
		type: 'number',
		default: 'undefined',
		description: 'Minimum number of characters required for form validation.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Placeholder text shown when the textarea is empty.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description:
			'Makes the textarea read-only; the value is visible but cannot be changed by the user.'
	},
	{
		name: 'required',
		type: 'boolean',
		default: 'false',
		description: 'Whether the textarea must have a value for form submission.'
	},
	{
		name: 'rows',
		type: 'number',
		default: 'undefined',
		description: 'Number of visible text rows. Determines the initial height of the textarea.'
	},
	{
		name: 'spellcheck',
		type: 'boolean',
		default: 'undefined',
		description: 'Whether the browser should check spelling in the textarea content.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'The current text value of the textarea. Bindable for two-way sync.'
	},
	{
		name: 'wrap',
		type: '"off" | "soft" | "hard"',
		default: 'undefined',
		description:
			'How the textarea wraps text during form submission. "hard" inserts newlines; "soft" does not.'
	}
];
