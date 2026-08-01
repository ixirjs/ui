<script lang="ts">
	import { ContextMenu } from '$lib/components/context-menu';
	import { DataGrid } from '$lib/components/datagrid';

	let rows = $state([
		{ id: 1, name: 'Alice Chen', role: 'Engineer' },
		{ id: 2, name: 'Bob Martinez', role: 'Designer' },
		{ id: 3, name: 'Charlie Kim', role: 'Product' }
	]);
</script>

<DataGrid.Root class="w-full rounded-lg border">
	<DataGrid.Header>
		<DataGrid.Row>
			<DataGrid.Column>Name</DataGrid.Column>
			<DataGrid.Column>Role</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		{#each rows as row (row.id)}
			<ContextMenu.Root>
				<ContextMenu.Trigger base={DataGrid.Row} class="cursor-context-menu px-8 py-0 rounded-none">
					<DataGrid.Cell>{row.name}</DataGrid.Cell>
					<DataGrid.Cell>{row.role}</DataGrid.Cell>
				</ContextMenu.Trigger>
				<ContextMenu.Content
					preset="context-menu.content"
					class="min-w-44 rounded-lg border bg-popover shadow-md p-0"
				>
					<ContextMenu.Item preset="context-menu.item" class="border-none"
						>Edit row</ContextMenu.Item
					>
					<ContextMenu.Item preset="context-menu.item" class="border-none text-destructive"
						>Delete row</ContextMenu.Item
					>
				</ContextMenu.Content>
			</ContextMenu.Root>
		{/each}
	</DataGrid.Body>
</DataGrid.Root>
