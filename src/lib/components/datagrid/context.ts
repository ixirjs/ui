import { getContext, setContext } from 'svelte';

// ── Header context ─────────────────────────────────────────────────────────
// Set by DataGrid.Header, read by DataGridRowBondState to decide whether a row
// is a header row. A single reactive flag — read `isHeader` by value, not by
// context presence, so header-ness can change reactively if a section ever does.

const DATAGRID_HEADER_CONTEXT_KEY = '@atoms/context/datagrid/header';

export type DatagridHeaderContext = {
	readonly isHeader: boolean;
};

export function getDatagridHeaderContext(): DatagridHeaderContext | undefined {
	return getContext(DATAGRID_HEADER_CONTEXT_KEY);
}

export function setDatagridHeaderContext(context: DatagridHeaderContext): void {
	setContext(DATAGRID_HEADER_CONTEXT_KEY, context);
}
