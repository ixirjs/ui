<script lang="ts">
	// The COLUMN axis. The row fixture next door scales rows at zero columns, which cannot see the
	// one owner-wide per-child read this family has: every cell resolves its column through
	// `bond.columns.values[index]` (`datagrid/cell/datagrid-cell.svelte`). With R fixed and C
	// scaled there are R×C cells each reading a C-long collection, so a regression that makes
	// `values` allocate or scan per read shows up as k≈2 here and is invisible on the row axis.
	//
	// Rows are held low deliberately: the unit under test is the column, and R only has to be
	// greater than one for the per-cell read to happen at all.
	import { DataGrid } from '$ixirjs/ui/components/datagrid';

	let { n = 50 }: { n?: number } = $props();

	const ROWS = 4;
</script>

<DataGrid.Root>
	<DataGrid.Header>
		<DataGrid.Row>
			{#each { length: n } as _, c (c)}
				<DataGrid.Column id={`c${c}`}>Col {c}</DataGrid.Column>
			{/each}
		</DataGrid.Row>
	</DataGrid.Header>
	<DataGrid.Body>
		{#each { length: ROWS } as _, r (r)}
			<DataGrid.Row value={String(r)}>
				{#each { length: n } as _, c (c)}
					<DataGrid.Cell>{r}-{c}</DataGrid.Cell>
				{/each}
			</DataGrid.Row>
		{/each}
	</DataGrid.Body>
</DataGrid.Root>
