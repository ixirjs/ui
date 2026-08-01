export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const textareaRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Content of the textarea root wrapper, typically Textarea.Control.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const textareaInputProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The current text value of the textarea. Bindable for two-way sync.'
	},
	{
		name: 'placeholder',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Placeholder text shown when the textarea is empty.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disables the textarea, preventing user input and applying disabled styling.'
	},
	{
		name: 'readonly',
		type: 'boolean | undefined',
		default: 'false',
		description:
			'Makes the textarea read-only; the value is visible but cannot be changed by the user.'
	},
	{
		name: 'rows',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Number of visible text rows. Determines the initial height of the textarea.'
	},
	{
		name: 'cols',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Number of visible text columns. Determines the initial width of the textarea.'
	},
	{
		name: 'maxlength',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Maximum number of characters allowed in the textarea.'
	},
	{
		name: 'minlength',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Minimum number of characters required for form validation.'
	},
	{
		name: 'required',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the textarea must have a value for form submission.'
	},
	{
		name: 'autofocus',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the textarea should receive focus automatically when the page loads.'
	},
	{
		name: 'autocomplete',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Browser autocomplete hint. Use "on", "off", or a specific token like "street-address".'
	},
	{
		name: 'spellcheck',
		type: 'boolean | undefined',
		default: 'undefined',
		description: 'Whether the browser should check spelling in the textarea content.'
	},
	{
		name: 'wrap',
		type: '"soft" | "hard" | "off" | undefined',
		default: 'undefined',
		description:
			'How the textarea wraps text during form submission. "hard" inserts newlines; "soft" does not.'
	}
];
