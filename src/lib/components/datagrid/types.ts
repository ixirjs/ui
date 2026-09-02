import type { Snippet } from 'svelte';
import type { OmitKey } from '$ixirjs/ui/types';
import type { MouseEventHandler } from 'svelte/elements';
import type { DataGridBond } from './bond.svelte';
import type { CheckboxProps } from '$ixirjs/ui/components/checkbox/types';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { DataGridRowBond } from './row/bond.svelte';
import type { IDataGridRowApi } from './row/record.svelte';
import type { DataGridColumnBond } from './column/bond.svelte';
import type { RenderProps, Base, SnippetProps, PlainPartProps } from '$ixirjs/ui/authoring';
import type { HtmlElementTagName } from '$ixirjs/ui/components/element';
import type { Direction, SortableType, Override } from '$ixirjs/ui/types';

// Shared types

export type { Direction, SortableType };

export interface SortBy {
	id: string;
	direction: Direction;
	by?: SortableType;
}

// Snippet props

export interface DatagridSnippetProps<T = unknown> extends SnippetProps {
	datagrid: DataGridBond<T> | undefined;
}

export type DatagridChildren<T = unknown> = Snippet<[DatagridSnippetProps<T>]>;

export interface DatagridColumnSnippetProps<T = unknown> extends SnippetProps {
	column: DataGridColumnBond<T>;
}

export type DatagridColumnChildren<T = unknown> = Snippet<[DatagridColumnSnippetProps<T>]>;

export interface DatagridRowSnippetProps<T = unknown> extends SnippetProps {
	/**
	 * The row, as the interface both shapes implement. A row is a `DataGridRowBond` only when this
	 * component is given a `factory`; by default it is a lightweight record registered with the
	 * grid. `row.select()`, `row.isSelected`, `row.id` and `row.datagrid` are identical either way.
	 */
	row: IDataGridRowApi<T>;
}

export type DatagridRowChildren<T = unknown> = Snippet<[DatagridRowSnippetProps<T>]>;

// Component prop types

export interface DatagridRootProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DatagridChildren<T>> {
	/** Explicit CSS grid-template-columns value. When omitted, auto-computed from Column widths. */
	template?: string;
	/** Fallback column template used when no template and no Column columns are mounted yet. */
	fallbackTemplate?: string;
	/**
	 * Bindable array of selected row IDs. Use bind:values for two-way binding.
	 * @default []
	 */
	values?: string[];
	/** Custom factory to create the DataGridBond instance. Useful for extending or pre-configuring the bond. */
	factory?: Factory<DataGridBond<T>>;
	/** Semantic callback fired after selected row IDs commit. */
	onvalueschange?: StateChangeCallback<string[], DataGridBond<T>>;
}

export interface DatagridHeaderProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DatagridChildren<T>> {}

export interface DatagridBodyProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DatagridChildren<T>> {}

export interface DatagridFooterProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DatagridChildren<T>> {}

export interface DatagridColumnProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	RenderProps<E, B, DatagridColumnChildren<T>>,
	{
		/** Cell renderer for this column; receives the row and the resolved cell props. */
		children?: DatagridColumnChildren<T>;
		/** Native click callback, invoked before the sort commits. Call `event.preventDefault()` to cancel sorting. */
		onclick?: MouseEventHandler<HTMLElementTagNameMap[E]>;
	}
> {
	/**
	 * Unique column identifier. Defaults to a hydration-stable generated id. Used to associate Cell cells with their column.
	 * @default $props.id()
	 */
	id?: string;
	/** Column width token used in the auto-computed grid-template-columns (e.g. "200px", "auto", "1fr"). */
	width?: string;
	/** Current sort direction for this column. Toggles on click or Enter/Space when sortable is set. Only one column holds the grid sort at a time — aria-sort is present on that column alone. */
	direction?: Direction;
	/** Reserved for responsive breakpoint control. */
	screen?: string;
	/** Enables click-to-sort on this column. Pass a string to set the sort `by` field. */
	sortable?: boolean | SortableType;
	/**
	 * Hides this column and its corresponding Cell cells from the grid layout.
	 * @default false
	 */
	hidden?: boolean;
	/** Custom factory to create the DataGridColumnBond instance for this column. */
	factory?: Factory<DataGridColumnBond<T>>;
	// Keyboard activation (Enter/Space on a sortable header) reports the KeyboardEvent.
	/** Fired after sorting commits, from a click or from Enter/Space on the focused header. Receives `(sort, { event, bond, reason })` where `reason` is `click` or `keyboard`; `sort` contains `id`, optional `by`, and `direction`. */
	onsort?: StateChangeCallback<SortBy, DataGridColumnBond<T>, MouseEvent | KeyboardEvent>;
}

// `onclick` was re-declared here; it is now inherited from `ElementProps` with the same element
// type. Kept as an interface rather than collapsed to an alias so it stays augmentable.
// The cell IS its `<div>` — no `as`, no `base`, no motion (`PlainPartProps`, ADR 0008): the
// dispatch that honoured them was half of a cell's mount cost, three cells per row.
export interface DatagridCellProps<T = unknown> extends PlainPartProps<'div', DatagridChildren<T>> {
	/** Native click callback. Receives only the DOM event. */
	onclick?: ((event: MouseEvent) => void) | undefined;
}

export interface DatagridCheckboxProps extends OmitKey<CheckboxProps, 'children'> {
	/**
	 * Bindable checked state. Automatically derived from selection state unless overridden.
	 * @default false
	 */
	checked?: boolean;
	/** Event-only checkbox callback. Call `event.preventDefault()` to cancel selection. */
	oninput?: (event: Event) => void;
	/** Event-only checkbox callback. Call `event.preventDefault()` to cancel selection. */
	onchange?: (event: Event) => void;
}

// The row IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface DatagridRowProps<T = unknown> extends Override<
	PlainPartProps<'div', DatagridRowChildren<T>>,
	{
		/** Renderer for this row’s cells. */
		children?: DatagridRowChildren<T>;
		/** Native click callback. Receives only the DOM event. */
		onclick?: MouseEventHandler<HTMLDivElement>;
	}
> {
	/**
	 * Marks this row as a header row. Header rows are not registered in the selection map and
	 * receive header styling.
	 * @default false
	 */
	header?: boolean | undefined;
	/** Row identifier used for selection tracking. Rows without a value are not selectable. */
	value?: string;
	/** CSS grid-template-rows value for subgrid row height control. */
	rows?: string;
	/** The data object associated with this row, available via the bond. */
	data?: T;
	/** Custom factory to create the DataGridRowBond instance for this row. */
	factory?: Factory<DataGridRowBond<T>>;
}
