import { getContext, setContext } from 'svelte';
// Type-only: erased at compile time, so this adds no runtime edge back to the bond module.
import type { DataGridBond } from './bond.svelte';
import type { IDataGridRowApi } from './row/record.svelte';

// Header context: set by DataGrid.Header, read by row bonds. Read `isHeader` by value (not context presence) so header-ness stays reactive.

const DATAGRID_HEADER_CONTEXT_KEY = '@atoms/context/datagrid/header';
const DATAGRID_ROW_RENDER_CONTEXT_KEY = '@atoms/context/datagrid/row-render';
/**
 * Exported because a checkbox rendered on its own — as `datagrid-callback.svelte.spec.ts` does, to
 * drive one in isolation — has to seed the row it should see, and the row is no longer reachable
 * through `DataGridRowBond.CONTEXT_KEY` unless the consumer passed a `factory`.
 */
export const DATAGRID_ROW_CONTEXT_KEY = '@atoms/context/datagrid/row';

export type DatagridHeaderContext = {
	readonly isHeader: boolean;
};

/**
 * Initial render-order fallback for cell→column association.
 *
 * The DOM position remains authoritative once a cell mounts. During SSR there is no element to
 * inspect, so each row assigns its cells an initialization ordinal. This keeps hidden-column
 * projection deterministic without making column ids a required public prop.
 */
export type DatagridRowRenderContext = {
	claimCellIndex(): number;
	/**
	 * The grid Bond the row already resolved.
	 *
	 * Every cell needs it to read its column, and every cell already reads this context for its
	 * index — so resolving the grid separately walked the context chain a second time per cell,
	 * seven times per row on the reference grid, to arrive at the object the row was holding. The
	 * row is the one place that lookup belongs.
	 */
	readonly datagrid: DataGridBond | undefined;
};

/**
 * The row a descendant is inside, as an INTERFACE rather than as a Bond.
 *
 * A row is a Bond only when the consumer passes `factory`; by default it is a plain record. Both
 * publish here, so `DataGrid.Checkbox` reads one shape and neither path is special-cased. Reading
 * `DataGridRowBond.get()` instead would see nothing on the default path.
 */
export function getDatagridRowContext<T = unknown>(): IDataGridRowApi<T> | undefined {
	return getContext(DATAGRID_ROW_CONTEXT_KEY);
}

export function setDatagridRowContext<T>(row: IDataGridRowApi<T>): void {
	setContext(DATAGRID_ROW_CONTEXT_KEY, row);
}

export function getDatagridHeaderContext(): DatagridHeaderContext | undefined {
	return getContext(DATAGRID_HEADER_CONTEXT_KEY);
}

export function setDatagridHeaderContext(context: DatagridHeaderContext): void {
	setContext(DATAGRID_HEADER_CONTEXT_KEY, context);
}

export function getDatagridRowRenderContext(): DatagridRowRenderContext | undefined {
	return getContext(DATAGRID_ROW_RENDER_CONTEXT_KEY);
}

export function setDatagridRowRenderContext(context: DatagridRowRenderContext): void {
	setContext(DATAGRID_ROW_RENDER_CONTEXT_KEY, context);
}
