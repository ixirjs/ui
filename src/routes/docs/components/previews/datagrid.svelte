<script lang="ts">
	import { DataGrid } from '$lib/components/datagrid';
</script>

<div class="w-full max-w-xs">
	<DataGrid.Root class="text-xs w-full">
		<DataGrid.Header>
			<DataGrid.Row header>
				<DataGrid.Column>Name</DataGrid.Column>
				<DataGrid.Column>Role</DataGrid.Column>
				<DataGrid.Column>Status</DataGrid.Column>
			</DataGrid.Row>
		</DataGrid.Header>
		<DataGrid.Body>
			<DataGrid.Row value="1">
				<DataGrid.Cell>Alice</DataGrid.Cell>
				<DataGrid.Cell>Admin</DataGrid.Cell>
				<DataGrid.Cell>Active</DataGrid.Cell>
			</DataGrid.Row>
			<DataGrid.Row value="2">
				<DataGrid.Cell>Bob</DataGrid.Cell>
				<DataGrid.Cell>Editor</DataGrid.Cell>
				<DataGrid.Cell>Idle</DataGrid.Cell>
			</DataGrid.Row>
		</DataGrid.Body>
	</DataGrid.Root>
</div>
