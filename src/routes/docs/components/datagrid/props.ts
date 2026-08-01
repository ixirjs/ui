export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const datagridRootProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes applied to the root grid element.'
	},
	{
		name: 'template',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Explicit CSS grid-template-columns value. When omitted, auto-computed from Column widths.'
	},
	{
		name: 'fallbackTemplate',
		type: 'string',
		default: "'auto'",
		description:
			'Fallback column template used when no template and no Column columns are mounted yet.'
	},
	{
		name: 'values',
		type: 'string[]',
		default: '[]',
		description: 'Bindable array of selected row IDs. Use bind:values for two-way binding.'
	},
	{
		name: 'onvalueschange',
		type: 'StateChangeCallback<string[], DataGridBond<T>> | undefined',
		default: 'undefined',
		description: 'Semantic callback fired after selected row IDs commit.'
	},
	{
		name: 'factory',
		type: 'Factory<DataGridBond<T>> | undefined',
		default: 'undefined',
		description:
			'Custom factory to create the DataGridBond instance. Useful for extending or pre-configuring the bond.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ datagrid: DataGridBond<T> | undefined }]> | undefined',
		default: 'undefined',
		description: 'Slot for Header, Body, and Footer sections. Receives the datagrid bond.'
	}
];

export const datagridHeaderProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the header container.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ datagrid: DataGridBond<T> | undefined }]> | undefined',
		default: 'undefined',
		description: 'Header row content. Receives the datagrid bond.'
	}
];

export const datagridBodyProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the body container.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ datagrid: DataGridBond<T> | undefined }]> | undefined',
		default: 'undefined',
		description: 'Data row content. Receives the datagrid bond.'
	}
];

export const datagridFooterProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the footer container.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ datagrid: DataGridBond<T> | undefined }]> | undefined',
		default: 'undefined',
		description: 'Footer content. Receives the datagrid bond.'
	}
];

export const datagridTrProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the row element.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description:
			'Row identifier used for selection tracking. Rows without a value are not selectable.'
	},
	{
		name: 'rows',
		type: 'string',
		default: "'auto'",
		description: 'CSS grid-template-rows value for subgrid row height control.'
	},
	{
		name: 'header',
		type: 'boolean',
		default: 'false',
		description:
			'Marks this row as a header row. Header rows are not registered in the selection map and receive header styling.'
	},
	{
		name: 'data',
		type: 'T | undefined',
		default: 'undefined',
		description: 'The data object associated with this row, available via the bond.'
	},
	{
		name: 'factory',
		type: 'Factory<DataGridRowBond<T>> | undefined',
		default: 'undefined',
		description: 'Custom factory to create the DataGridRowBond instance for this row.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ row: DataGridRowBond<T> }]> | undefined',
		default: 'undefined',
		description: 'Row cell content. Receives the row bond.'
	}
];

export const datagridThProps: PropDefinition[] = [
	{
		name: 'id',
		type: 'string',
		default: '$props.id()',
		description:
			'Unique column identifier. Defaults to a hydration-stable generated id. Used to associate Cell cells with their column.'
	},
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the column header element.'
	},
	{
		name: 'width',
		type: 'string',
		default: "'1fr'",
		description:
			'Column width token used in the auto-computed grid-template-columns (e.g. "200px", "auto", "1fr").'
	},
	{
		name: 'direction',
		type: "'asc' | 'desc'",
		default: "'asc'",
		description: 'Bindable current sort direction. Toggles on click when sortable is set.'
	},
	{
		name: 'screen',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Reserved for responsive breakpoint control.'
	},
	{
		name: 'sortable',
		type: 'boolean | SortableType | undefined',
		default: 'undefined',
		description: 'Enables click-to-sort on this column. Pass a string to set the sort `by` field.'
	},
	{
		name: 'hidden',
		type: 'boolean',
		default: 'false',
		description: 'Hides this column and its corresponding Cell cells from the grid layout.'
	},
	{
		name: 'factory',
		type: '(() => DataGridColumnBond<T>) | undefined',
		default: 'undefined',
		description: 'Custom factory to create the DataGridColumnBond instance for this column.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Call `event.preventDefault()` to cancel sorting.'
	},
	{
		name: 'onsort',
		type: 'StateChangeCallback<SortBy, DataGridColumnBond<T>, MouseEvent> | undefined',
		default: 'undefined',
		description:
			'Fired after sorting commits. Receives `(sort, { event, bond, reason })`; `sort` contains `id`, optional `by`, and `direction`.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ column: DataGridColumnBond<T> }]> | undefined',
		default: 'undefined',
		description: 'Column header content. Receives the column bond.'
	}
];

export const datagridTdProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the cell element.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	{
		name: 'children',
		type: 'Snippet<[{ datagrid: DataGridBond<T> | undefined }]> | undefined',
		default: 'undefined',
		description:
			'Cell content. Receives the datagrid bond. Also accepts a component via the base prop.'
	}
];

export const datagridCheckboxProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes for the checkbox element.'
	},
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Value attribute forwarded to the underlying Checkbox.'
	},
	{
		name: 'checked',
		type: 'boolean',
		default: 'false',
		description:
			'Bindable checked state. Automatically derived from selection state unless overridden.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Event-only checkbox callback. Call `event.preventDefault()` to cancel selection.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Event-only checkbox callback. Call `event.preventDefault()` to cancel selection.'
	}
];
