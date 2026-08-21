<script lang="ts">
	// One grid, n rows. Rows register with the grid Bond; cells claim an index from the row.
	import { DataGrid } from '$ixirjs/ui/components/datagrid';

	let { n = 100 }: { n?: number } = $props();
</script>

<DataGrid.Root>
	<DataGrid.Body>
		{#each { length: n } as _, i (i)}
			<DataGrid.Row value={String(i)}>
				<DataGrid.Cell>Name {i}</DataGrid.Cell>
				<DataGrid.Cell>Email {i}</DataGrid.Cell>
				<DataGrid.Cell>Role {i}</DataGrid.Cell>
			</DataGrid.Row>
		{/each}
	</DataGrid.Body>
</DataGrid.Root>
