<script lang="ts">
	import { DataGrid } from '$lib/components/datagrid';

	let { data = [] } = $props();
</script>

<div class="border-border overflow-x-auto max-w-full flex-1 bg-card rounded-lg border">
	<DataGrid.Root
		class="min-w-max overflow-hidden"
		fallbackTemplate="auto auto auto minmax(auto, 1fr)"
	>
		<DataGrid.Header class="bg-muted">
			<DataGrid.Row class="border-border border-b">
				<DataGrid.Column
					width="auto"
					class="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>Prop</DataGrid.Column
				>
				<DataGrid.Column
					width="auto"
					class="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>Type</DataGrid.Column
				>
				<DataGrid.Column
					width="auto"
					class="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>Default</DataGrid.Column
				>
				<DataGrid.Column
					width="1fr"
					class="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>Description</DataGrid.Column
				>
			</DataGrid.Row>
		</DataGrid.Header>

		<DataGrid.Body>
			{#each data as item (item)}
				<DataGrid.Row>
					<DataGrid.Cell class="text-foreground px-6 py-4 font-mono text-sm whitespace-nowrap"
						>{item.name}</DataGrid.Cell
					>
					<DataGrid.Cell class="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap"
						>{item.type}</DataGrid.Cell
					>
					<DataGrid.Cell class="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap"
						>{item.default}</DataGrid.Cell
					>
					<DataGrid.Cell class="text-foreground px-6 py-4 text-sm whitespace-nowrap"
						>{item.description}</DataGrid.Cell
					>
				</DataGrid.Row>
			{/each}
		</DataGrid.Body>
	</DataGrid.Root>
</div>
