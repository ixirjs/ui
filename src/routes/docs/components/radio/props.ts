export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const radioProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'T | undefined',
		default: 'undefined',
		description:
			'The value this radio button represents. Compared against `group` to determine the checked state.'
	},
	{
		name: 'group',
		type: 'T | undefined',
		default: 'undefined',
		description: 'The currently selected value. The radio is checked when `group === value`.'
	},
	{
		name: 'id',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The id attribute of the radio input element, used for label association.'
	},
	{
		name: 'name',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The name attribute of the radio input, groups radios for form submission.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the radio button is disabled and non-interactive.'
	},
	{
		name: 'required',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the radio button is required to be selected for form validation.'
	},
	{
		name: 'readonly',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the radio button value is readonly and cannot be changed by the user.'
	},
	{
		name: 'checkedContent',
		type: 'Component | Snippet | undefined',
		default: 'undefined',
		description:
			'Custom component or snippet rendered in place of the default indicator when the radio is checked.'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Label text or content displayed alongside the radio input.'
	},
	{
		name: 'oncheckedchange',
		type: 'StateChangeCallback<boolean> | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after this item’s checked state commits for both selection and deselection. The context includes `event` when the native event is available.'
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

export const radioGroupProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'T | undefined',
		default: 'undefined',
		description: 'The currently selected value in the group. Bindable for two-way synchronization.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disables all radio buttons in the group.'
	},
	{
		name: 'required',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Marks all radio buttons in the group as required.'
	},
	{
		name: 'readonly',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Makes all radio buttons in the group readonly.'
	},
	{
		name: 'name',
		type: 'string | undefined',
		default: 'undefined',
		description: 'The shared name attribute applied to all radio buttons in the group.'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description: 'Radio buttons and other content to render inside the group container.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<T> | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after the selected group value commits. Receives `(value, { event })` with the native item event.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native callback for input events bubbling from radio items.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native callback for change events bubbling from radio items.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
