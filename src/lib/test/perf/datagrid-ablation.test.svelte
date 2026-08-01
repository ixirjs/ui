<script lang="ts">
	// The collection path, measured on its own.
	//
	// This is a SEPARATE fixture from `ablation.test.svelte` on purpose. That file is a ladder whose
	// rungs all render the same card structure, and its per-layer output SHA is the equivalence
	// anchor the gate compares across commits. Adding a differently-shaped branch to it wraps every
	// existing branch in an `{#if}`, and Svelte's SSR block anchors change the bytes of every rung —
	// which resets the very fingerprints the gate exists to protect. A row is not a card, so it gets
	// its own component and its own baseline entry.
	//
	// The unit is a ROW. One grid wraps n rows, and the slope between two instance counts amortizes
	// the Root/Body away. Each row owns a Bond and a registered root Atom; each cell is a static
	// component that reads its column association from the row's render context.
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
