<script lang="ts">
	import { DataGrid, type SortBy } from '$lib/components/datagrid';

	const users = [
		{ id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
		{ id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
		{ id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Editor' }
	];

	// The grid owns which column is sorted and reports commits; ordering the data stays yours, so
	// the same handler works for a client array or a server refetch.
	let sort = $state<{ field: keyof (typeof users)[number]; direction: 'asc' | 'desc' }>({
		field: 'name',
		direction: 'asc'
	});

	const sorted = $derived(
		[...users].sort((left, right) => {
			const order = String(left[sort.field]).localeCompare(String(right[sort.field]));
			return sort.direction === 'asc' ? order : -order;
		})
	);

	function handleSort(next: SortBy) {
		sort = { field: next.by as keyof (typeof users)[number], direction: next.direction };
	}
</script>

<DataGrid.Root>
	<DataGrid.Header>
		<DataGrid.Row header>
			<DataGrid.Column sortable="name" onsort={handleSort}>Name</DataGrid.Column>
			<DataGrid.Column sortable="email" onsort={handleSort}>Email</DataGrid.Column>
			<DataGrid.Column>Role</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		{#each sorted as user (user.id)}
			<DataGrid.Row value={user.id}>
				<DataGrid.Cell>{user.name}</DataGrid.Cell>
				<DataGrid.Cell>{user.email}</DataGrid.Cell>
				<DataGrid.Cell>{user.role}</DataGrid.Cell>
			</DataGrid.Row>
		{/each}
	</DataGrid.Body>
</DataGrid.Root>
