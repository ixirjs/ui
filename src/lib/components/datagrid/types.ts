import type { Snippet } from 'svelte';
import type { MouseEventHandler } from 'svelte/elements';
import type { DataGridBond } from './bond.svelte';
import type { CheckboxProps } from '$ixirjs/ui/components/checkbox/types';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { DataGridRowBond } from './row/bond.svelte';
import type { DataGridColumnBond } from './column/bond.svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { PresetKey } from '$ixirjs/ui/preset';
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
	row: DataGridRowBond<T>;
}

export type DatagridRowChildren<T = unknown> = Snippet<[DatagridRowSnippetProps<T>]>;

// Component prop types

export interface DatagridRootProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DatagridChildren<T>> {
	template?: string;
	fallbackTemplate?: string;
	values?: string[];
	factory?: Factory<DataGridBond<T>>;
	onvalueschange?: StateChangeCallback<string[], DataGridBond<T>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatagridHeaderProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DatagridChildren<T>> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatagridBodyProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DatagridChildren<T>> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatagridFooterProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DatagridChildren<T>> {}

export interface DatagridColumnProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	HtmlAtomProps<E, B, DatagridColumnChildren<T>>,
	{
		children?: DatagridColumnChildren<T>;
		onclick?: MouseEventHandler<HTMLElementTagNameMap[E]>;
	}
> {
	id?: string;
	width?: string;
	direction?: Direction;
	screen?: string;
	sortable?: boolean | SortableType;
	hidden?: boolean;
	factory?: Factory<DataGridColumnBond<T>>;
	// Keyboard activation (Enter/Space on a sortable header) reports the KeyboardEvent.
	onsort?: StateChangeCallback<SortBy, DataGridColumnBond<T>, MouseEvent | KeyboardEvent>;
	// Re-declared because `Override` collapses it into HtmlAtomProps' index signature.
	preset?: PresetKey;
}

// `onclick` was re-declared here; it is now inherited from `ElementProps` with the same element
// type. Kept as an interface rather than collapsed to an alias so it stays augmentable.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatagridCellProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DatagridChildren<T>> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatagridCheckboxProps extends Omit<CheckboxProps, 'children'> {}

export interface DatagridRowProps<
	T = unknown,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	HtmlAtomProps<E, B, DatagridRowChildren<T>>,
	{
		children?: DatagridRowChildren<T>;
		onclick?: MouseEventHandler<HTMLElementTagNameMap[E]>;
	}
> {
	value?: string;
	rows?: string;
	data?: T;
	factory?: Factory<DataGridRowBond<T>>;
	// Re-declared because `Override` collapses it into HtmlAtomProps' index signature.
	preset?: PresetKey;
}
