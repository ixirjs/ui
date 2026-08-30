import {
	DataGridBond,
	type DataGridBondProps,
	type IDataGrid,
	type IDataGridRow
} from '$ixirjs/ui/components/datagrid/bond.svelte';
import {
	DataGridColumnBond,
	type DataGridColumnBondProps
} from '$ixirjs/ui/components/datagrid/column/bond.svelte';
import {
	DataGridRowBond,
	type DataGridRowBondProps
} from '$ixirjs/ui/components/datagrid/row/bond.svelte';

type RowData = { label: string };

function assertGenericFacadePrecision(
	gridProps: DataGridBondProps<RowData>,
	rowProps: DataGridRowBondProps<RowData>,
	columnProps: DataGridColumnBondProps
): void {
	const grid: DataGridBond<RowData> = new DataGridBond<RowData>(gridProps);
	const optionalGrid: DataGridBond<RowData> | undefined = DataGridBond.get<RowData>();
	const requiredGrid: DataGridBond<RowData> = DataGridBond.getOrThrow<RowData>();
	const createdGrid: DataGridBond<RowData> = DataGridBond.create<RowData>(gridProps);
	const selectedRows: readonly IDataGridRow<RowData>[] = grid.selectedRows;

	const row: DataGridRowBond<RowData> = new DataGridRowBond<RowData>(rowProps);
	const optionalRow: DataGridRowBond<RowData> | undefined = DataGridRowBond.get<RowData>();
	const requiredRow: DataGridRowBond<RowData> = DataGridRowBond.getOrThrow<RowData>();
	const createdRow: DataGridRowBond<RowData> = DataGridRowBond.create<RowData>(rowProps);
	const rowData: RowData | undefined = row.props.data;

	const column: DataGridColumnBond<RowData> = new DataGridColumnBond<RowData>(columnProps);
	const optionalColumn: DataGridColumnBond<RowData> | undefined = DataGridColumnBond.get<RowData>();
	const requiredColumn: DataGridColumnBond<RowData> = DataGridColumnBond.getOrThrow<RowData>();
	const createdColumn: DataGridColumnBond<RowData> =
		DataGridColumnBond.create<RowData>(columnProps);
	const columnGrid: IDataGrid<RowData> = column.datagrid;

	void [
		grid,
		optionalGrid,
		requiredGrid,
		createdGrid,
		selectedRows,
		row,
		optionalRow,
		requiredRow,
		createdRow,
		rowData,
		column,
		optionalColumn,
		requiredColumn,
		createdColumn,
		columnGrid
	];
}

void assertGenericFacadePrecision;
