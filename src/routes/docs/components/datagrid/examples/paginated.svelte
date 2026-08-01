<script lang="ts">
	import { DataGrid } from '$lib/components/datagrid';
	import { Pagination } from '$lib/components/pagination';

	const users = Array.from({ length: 25 }, (_, index) => ({
		id: String(index + 1),
		name: `Member ${index + 1}`,
		role: index % 3 === 0 ? 'Admin' : 'User'
	}));

	const pageSize = 10;
	let page = $state(1);

	// Pagination is its own family, composed into the grid's footer rather than built into it —
	// the same component paginates a list, a gallery, or search results. It owns the page state
	// and the control boundaries; slicing stays yours, so a server-paginated source fetches here
	// instead of slicing.
	const visible = $derived(users.slice((page - 1) * pageSize, page * pageSize));
</script>

<DataGrid.Root>
	<DataGrid.Header>
		<DataGrid.Row header>
			<DataGrid.Column>Name</DataGrid.Column>
			<DataGrid.Column>Role</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		{#each visible as user (user.id)}
			<DataGrid.Row value={user.id}>
				<DataGrid.Cell>{user.name}</DataGrid.Cell>
				<DataGrid.Cell>{user.role}</DataGrid.Cell>
			</DataGrid.Row>
		{/each}
	</DataGrid.Body>
	<DataGrid.Footer>
		<Pagination.Root bind:page {pageSize} total={users.length} class="flex items-center gap-2">
			{#snippet children({ pagination })}
				<Pagination.Previous class="aria-disabled:opacity-50">Previous</Pagination.Previous>
				<span>Page {pagination.page} of {pagination.pageCount}</span>
				<Pagination.Next class="aria-disabled:opacity-50">Next</Pagination.Next>
			{/snippet}
		</Pagination.Root>
	</DataGrid.Footer>
</DataGrid.Root>
