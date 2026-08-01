<script lang="ts">
	import { DataGrid } from '$ixirjs/ui';

	let { count = 100, activeKey = undefined }: { count?: number; activeKey?: string } = $props();
	const items = $derived(Array.from({ length: count }, (_, index) => ({ id: `row-${index}` })));
</script>

<DataGrid.Root>
	<DataGrid.VirtualBody
		{items}
		getKey={(item) => item.id}
		estimateSize={20}
		height={80}
		overscan={1}
		{activeKey}
	>
		{#snippet children({ item })}
			<span data-row={item.id}>{item.id}</span>
		{/snippet}
	</DataGrid.VirtualBody>
</DataGrid.Root>
