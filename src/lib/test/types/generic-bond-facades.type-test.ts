import {
	DataGridBond,
	type DataGridBondProps,
	type IDataGrid,
	type IDataGridRow
} from '$ixirjs/ui/components/datagrid/bond.svelte';
import {
	DataGridCellBond,
	type DataGridCellBondProps
} from '$ixirjs/ui/components/datagrid/cell/bond.svelte';
import {
	DataGridColumnBond,
	type DataGridColumnBondProps
} from '$ixirjs/ui/components/datagrid/column/bond.svelte';
import {
	DataGridRowBond,
	type DataGridRowBondProps
} from '$ixirjs/ui/components/datagrid/row/bond.svelte';
import { DrawerBond, type DrawerBondProps } from '$ixirjs/ui/components/drawer/bond.svelte';
import type { AtomsOf, MergeAtoms, SpecOf } from '$ixirjs/ui/shared';

type Equal<Left, Right> =
	(<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
		? (<Value>() => Value extends Right ? 1 : 2) extends <Value>() => Value extends Left ? 1 : 2
			? true
			: false
		: false;
type Assert<Condition extends true> = Condition;
type SlotsOf<Definition> = keyof AtomsOf<SpecOf<Definition>>;

export type DrawerDefinitionSlotsArePreserved = Assert<
	Equal<
		SlotsOf<typeof DrawerBond>,
		'root' | 'content' | 'header' | 'title' | 'description' | 'body' | 'footer' | 'backdrop'
	>
>;
export type DataGridDefinitionSlotsArePreserved = Assert<
	Equal<SlotsOf<typeof DataGridBond>, 'root' | 'header' | 'body' | 'footer'>
>;
export type DataGridRowDefinitionSlotsArePreserved = Assert<
	Equal<SlotsOf<typeof DataGridRowBond>, 'root'>
>;
export type DataGridColumnDefinitionSlotsArePreserved = Assert<
	Equal<SlotsOf<typeof DataGridColumnBond>, 'root'>
>;
export type DataGridCellDefinitionSlotsArePreserved = Assert<
	Equal<SlotsOf<typeof DataGridCellBond>, 'root'>
>;
export type GenericDefinitionsRemainFusable = Assert<
	Equal<
		keyof MergeAtoms<[typeof DrawerBond, typeof DataGridBond]>,
		'root' | 'content' | 'header' | 'title' | 'description' | 'body' | 'footer' | 'backdrop'
	>
>;

type RowData = { label: string };

function assertGenericFacadePrecision(
	drawerProps: DrawerBondProps,
	gridProps: DataGridBondProps<RowData>,
	rowProps: DataGridRowBondProps<RowData>,
	columnProps: DataGridColumnBondProps,
	cellProps: DataGridCellBondProps<RowData>
): void {
	const drawer: DrawerBond = new DrawerBond(drawerProps);
	const optionalDrawer: DrawerBond | undefined = DrawerBond.get();
	const requiredDrawer: DrawerBond = DrawerBond.getOrThrow();
	const createdDrawer: DrawerBond = DrawerBond.create(drawerProps);

	const grid: DataGridBond<RowData> = new DataGridBond<RowData>(gridProps);
	const optionalGrid: DataGridBond<RowData> | undefined = DataGridBond.optional<RowData>();
	const requiredGrid: DataGridBond<RowData> = DataGridBond.required<RowData>();
	const createdGrid: DataGridBond<RowData> = DataGridBond.create<RowData>(gridProps);
	const selectedRows: readonly IDataGridRow<RowData>[] = grid.selectedRows;

	const row: DataGridRowBond<RowData> = new DataGridRowBond<RowData>(rowProps);
	const optionalRow: DataGridRowBond<RowData> | undefined = DataGridRowBond.optional<RowData>();
	const requiredRow: DataGridRowBond<RowData> = DataGridRowBond.required<RowData>();
	const createdRow: DataGridRowBond<RowData> = DataGridRowBond.create<RowData>(rowProps);
	const rowData: RowData | undefined = row.props.data;

	const column: DataGridColumnBond<RowData> = new DataGridColumnBond<RowData>(columnProps);
	const optionalColumn: DataGridColumnBond<RowData> | undefined =
		DataGridColumnBond.optional<RowData>();
	const requiredColumn: DataGridColumnBond<RowData> = DataGridColumnBond.required<RowData>();
	const createdColumn: DataGridColumnBond<RowData> =
		DataGridColumnBond.create<RowData>(columnProps);
	const columnGrid: IDataGrid<RowData> = column.datagrid;

	const cell: DataGridCellBond<RowData> = new DataGridCellBond<RowData>(cellProps);
	const optionalCell: DataGridCellBond<RowData> | undefined = DataGridCellBond.optional<RowData>();
	const requiredCell: DataGridCellBond<RowData> = DataGridCellBond.required<RowData>();
	const createdCell: DataGridCellBond<RowData> = DataGridCellBond.create<RowData>(cellProps);
	const cellGrid: IDataGrid<RowData> | undefined = cell.datagrid;

	void [
		drawer,
		optionalDrawer,
		requiredDrawer,
		createdDrawer,
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
		columnGrid,
		cell,
		optionalCell,
		requiredCell,
		createdCell,
		cellGrid
	];
}

void assertGenericFacadePrecision;
