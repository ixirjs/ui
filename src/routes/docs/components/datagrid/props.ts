import { renderPropsRow, type PropDefinition } from '$docs/types';

export const datagridRootProps: PropDefinition[] = [
	{
		name: 'factory',
		type: 'Factory<DataGridBond<T>>',
		default: 'undefined',
		description:
			'Custom factory to create the DataGridBond instance. Useful for extending or pre-configuring the bond.'
	},
	{
		name: 'fallbackTemplate',
		type: 'string',
		default: 'undefined',
		description:
			'Fallback column template used when no template and no Column columns are mounted yet.'
	},
	{
		name: 'onvalueschange',
		type: 'StateChangeCallback<string[], DataGridBond<T>>',
		default: 'undefined',
		description: 'Semantic callback fired after selected row IDs commit.'
	},
	{
		name: 'template',
		type: 'string',
		default: 'undefined',
		description:
			'Explicit CSS grid-template-columns value. When omitted, auto-computed from Column widths.'
	},
	{
		name: 'values',
		type: 'string[]',
		default: '[]',
		description: 'Bindable array of selected row IDs. Use bind:values for two-way binding.'
	},
	renderPropsRow
];

export const datagridHeaderProps: PropDefinition[] = [renderPropsRow];

export const datagridBodyProps: PropDefinition[] = [renderPropsRow];

export const datagridFooterProps: PropDefinition[] = [renderPropsRow];

export const datagridColumnProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'DatagridColumnChildren<T>',
		default: 'undefined',
		description: 'Cell renderer for this column; receives the row and the resolved cell props.'
	},
	{
		name: 'direction',
		type: 'Direction',
		default: 'undefined',
		description:
			'Current sort direction for this column. Toggles on click or Enter/Space when sortable is set. Only one column holds the grid sort at a time — aria-sort is present on that column alone.'
	},
	{
		name: 'factory',
		type: 'Factory<DataGridColumnBond<T>>',
		default: 'undefined',
		description: 'Custom factory to create the DataGridColumnBond instance for this column.'
	},
	{
		name: 'hidden',
		type: 'boolean',
		default: 'false',
		description: 'Hides this column and its corresponding Cell cells from the grid layout.'
	},
	{
		name: 'id',
		type: 'string',
		default: '$props.id()',
		description:
			'Unique column identifier. Defaults to a hydration-stable generated id. Used to associate Cell cells with their column.'
	},
	{
		name: 'onclick',
		type: 'MouseEventHandler<HTMLElementTagNameMap[E]>',
		default: 'undefined',
		description:
			'Native click callback, invoked before the sort commits. Call `event.preventDefault()` to cancel sorting.'
	},
	{
		name: 'onsort',
		type: 'StateChangeCallback<SortBy, DataGridColumnBond<T>, MouseEvent | KeyboardEvent>',
		default: 'undefined',
		description:
			'Fired after sorting commits, from a click or from Enter/Space on the focused header. Receives `(sort, { event, bond, reason })` where `reason` is `click` or `keyboard`; `sort` contains `id`, optional `by`, and `direction`.'
	},
	{
		name: 'screen',
		type: 'string',
		default: 'undefined',
		description: 'Reserved for responsive breakpoint control.'
	},
	{
		name: 'sortable',
		type: 'string | boolean',
		default: 'undefined',
		description: 'Enables click-to-sort on this column. Pass a string to set the sort `by` field.'
	},
	{
		name: 'width',
		type: 'string',
		default: 'undefined',
		description:
			'Column width token used in the auto-computed grid-template-columns (e.g. "200px", "auto", "1fr").'
	},
	renderPropsRow
];

export const datagridCellProps: PropDefinition[] = [
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	renderPropsRow
];

export const datagridCheckboxProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'false',
		description:
			'Bindable checked state. Automatically derived from selection state unless overridden.'
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
		description: 'Event-only checkbox callback. Call `event.preventDefault()` to cancel selection.'
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
		description: 'Event-only checkbox callback. Call `event.preventDefault()` to cancel selection.'
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

export const datagridRowProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'DatagridRowChildren<T>',
		default: 'undefined',
		description: 'Renderer for this row’s cells.'
	},
	{
		name: 'data',
		type: 'T',
		default: 'undefined',
		description: 'The data object associated with this row, available via the bond.'
	},
	{
		name: 'factory',
		type: 'Factory<DataGridRowBond<T>>',
		default: 'undefined',
		description: 'Custom factory to create the DataGridRowBond instance for this row.'
	},
	{
		name: 'header',
		type: 'boolean | undefined',
		default: 'false',
		description:
			'Marks this row as a header row. Header rows are not registered in the selection map and receive header styling.'
	},
	{
		name: 'onclick',
		type: 'MouseEventHandler<HTMLDivElement>',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	{
		name: 'rows',
		type: 'string',
		default: 'undefined',
		description: 'CSS grid-template-rows value for subgrid row height control.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description:
			'Row identifier used for selection tracking. Rows without a value are not selectable.'
	},
	renderPropsRow
];
