import { getContext, setContext } from 'svelte';
// Type-only: erased at compile time, so this adds no runtime edge back to the bond module.
import type { DataGridBond } from './bond.svelte';

// Header context: set by DataGrid.Header, read by row bonds. Read `isHeader` by value (not context presence) so header-ness stays reactive.

const DATAGRID_HEADER_CONTEXT_KEY = '@atoms/context/datagrid/header';
const DATAGRID_ROW_RENDER_CONTEXT_KEY = '@atoms/context/datagrid/row-render';

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
