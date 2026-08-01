export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const checkboxProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the checkbox is checked. Supports two-way binding with bind:checked.'
	},
	{
		name: 'indeterminate',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the checkbox is in the indeterminate state (partially selected group)'
	},
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The value attribute for group binding. Used alongside the group prop.'
	},
	{
		name: 'group',
		type: 'string[] | undefined',
		default: 'undefined',
		description: 'Bindable array for multi-checkbox group management (similar to Svelte bind:group)'
	},
	{
		name: 'checkedContent',
		type: 'Component | Snippet | undefined',
		default: 'undefined',
		description:
			'Custom content to render inside the checkbox when it is checked (e.g., a checkmark icon)'
	},
	{
		name: 'indeterminateContent',
		type: 'Component | Snippet | undefined',
		default: 'undefined',
		description: 'Custom content to render when the checkbox is in the indeterminate state'
	},
	{
		name: 'oncheckedchange',
		type: 'StateChangeCallback<boolean> | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after the checked state commits. Receives `(checked, { event })`.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native input-event callback. Receives only the DOM event.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native change-event callback. Receives only the DOM event.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
