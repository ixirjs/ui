<script lang="ts">
	import { DataGrid } from '$lib/components/datagrid';

	const users = [
		{ id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
		{ id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
		{ id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Editor' }
	];

	let selectedIds = $state<string[]>([]);
</script>

<div class="space-y-2">
	<DataGrid.Root bind:values={selectedIds}>
		<DataGrid.Header>
			<DataGrid.Row header>
				<DataGrid.Column width="auto">
					<DataGrid.Checkbox />
				</DataGrid.Column>
				<DataGrid.Column>Name</DataGrid.Column>
				<DataGrid.Column>Email</DataGrid.Column>
			</DataGrid.Row>
		</DataGrid.Header>
		<DataGrid.Body>
			{#each users as user (user.id)}
				<DataGrid.Row value={user.id}>
					<DataGrid.Cell>
						<DataGrid.Checkbox />
					</DataGrid.Cell>
					<DataGrid.Cell>{user.name}</DataGrid.Cell>
					<DataGrid.Cell>{user.email}</DataGrid.Cell>
				</DataGrid.Row>
			{/each}
		</DataGrid.Body>
	</DataGrid.Root>
	<p class="text-muted-foreground text-sm">Selected: {selectedIds.join(', ') || 'none'}</p>
</div>
