<script lang="ts">
	import { DataGrid } from '$ixirjs/ui/components/datagrid';
</script>

<DataGrid.Root fallbackTemplate="repeat(3, minmax(0, 1fr))" data-testid="grid">
	<DataGrid.Header>
		<DataGrid.Row>
			<DataGrid.Column id="name">Name</DataGrid.Column>
			<DataGrid.Column id="secret" hidden>Secret</DataGrid.Column>
			<DataGrid.Column id="status">Status</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		<DataGrid.Row value="alpha">
			<DataGrid.Cell>Alice</DataGrid.Cell>
			<DataGrid.Cell>classified</DataGrid.Cell>
			<DataGrid.Cell>Active</DataGrid.Cell>
		</DataGrid.Row>
		<DataGrid.Row value="beta">
			<DataGrid.Cell>Bob</DataGrid.Cell>
			<DataGrid.Cell>private</DataGrid.Cell>
			<DataGrid.Cell>Pending</DataGrid.Cell>
		</DataGrid.Row>
	</DataGrid.Body>
</DataGrid.Root>
