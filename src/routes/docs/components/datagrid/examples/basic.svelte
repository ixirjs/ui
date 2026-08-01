<script lang="ts">
	import { DataGrid } from '$lib/components/datagrid';

	const users = [
		{ id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
		{ id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
		{ id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Editor' }
	];
</script>

<DataGrid.Root>
	<DataGrid.Header>
		<DataGrid.Row header>
			<DataGrid.Column>Name</DataGrid.Column>
			<DataGrid.Column>Email</DataGrid.Column>
			<DataGrid.Column>Role</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		{#each users as user (user.id)}
			<DataGrid.Row value={user.id}>
				<DataGrid.Cell>{user.name}</DataGrid.Cell>
				<DataGrid.Cell>{user.email}</DataGrid.Cell>
				<DataGrid.Cell>{user.role}</DataGrid.Cell>
			</DataGrid.Row>
		{/each}
	</DataGrid.Body>
</DataGrid.Root>
