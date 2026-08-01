import { getContext, setContext } from 'svelte';

// Header context: set by DataGrid.Header, read by row bonds. Read `isHeader` by value (not context presence) so header-ness stays reactive.

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
