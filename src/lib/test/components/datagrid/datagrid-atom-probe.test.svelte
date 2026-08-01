<script lang="ts" module>
	import { DataGridBond, type DataGridBondProps } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import {
		DataGridColumnBond,
		type DataGridColumnBondProps
	} from '$ixirjs/ui/components/datagrid/column/bond.svelte';
	import {
		DataGridRowBond,
		type DataGridRowBondProps
	} from '$ixirjs/ui/components/datagrid/row/bond.svelte';

	export let capturedGrid: DataGridBond | undefined;
	export let capturedHeaderRow: DataGridRowBond | undefined;
	export let capturedBodyRow: DataGridRowBond | undefined;
	export let capturedGeneratedRow: DataGridRowBond | undefined;
	export let capturedColumn: DataGridColumnBond | undefined;

	export function resetCapturedDatagridBonds() {
		capturedGrid = undefined;
		capturedHeaderRow = undefined;
		capturedBodyRow = undefined;
		capturedGeneratedRow = undefined;
		capturedColumn = undefined;
	}
</script>

<script lang="ts">
	import { DataGrid } from '$ixirjs/ui/components/datagrid';

	function captureGrid(props: DataGridBondProps): DataGridBond {
		capturedGrid = DataGridBond.create(props);
		return capturedGrid;
	}

	function captureHeaderRow(props: DataGridRowBondProps): DataGridRowBond {
		capturedHeaderRow = DataGridRowBond.create(props);
		return capturedHeaderRow;
	}

	function captureBodyRow(props: DataGridRowBondProps): DataGridRowBond {
		capturedBodyRow = DataGridRowBond.create(props);
		return capturedBodyRow;
	}

	function captureGeneratedRow(props: DataGridRowBondProps): DataGridRowBond {
		capturedGeneratedRow = DataGridRowBond.create(props);
		return capturedGeneratedRow;
	}

	function captureColumn(props: DataGridColumnBondProps): DataGridColumnBond {
		capturedColumn = DataGridColumnBond.create(props);
		return capturedColumn;
	}
</script>

<DataGrid.Root values={['alpha']} factory={captureGrid}>
	<DataGrid.Header>
		<DataGrid.Row value="header" factory={captureHeaderRow}>
			<DataGrid.Column id="name" width="1fr" sortable factory={captureColumn}>Name</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		<DataGrid.Row value="alpha" factory={captureBodyRow}>
			<DataGrid.Cell>Alpha</DataGrid.Cell>
		</DataGrid.Row>
		<DataGrid.Row factory={captureGeneratedRow}>
			<DataGrid.Cell>Generated</DataGrid.Cell>
		</DataGrid.Row>
	</DataGrid.Body>
	<DataGrid.Footer>Footer</DataGrid.Footer>
</DataGrid.Root>
