<script lang="ts">
	import { Pagination } from '$ixirjs/ui/components/pagination';

	let {
		pageSize = 10,
		total = undefined,
		disabled = false
	}: { pageSize?: number; total?: number | undefined; disabled?: boolean } = $props();
	let page = $state(1);
</script>

<Pagination.Root bind:page {pageSize} {total} {disabled} data-testid="root">
	{#snippet children({ pagination })}
		<Pagination.Previous data-testid="previous">Previous</Pagination.Previous>
		<output data-testid="page">{pagination.page}</output>
		<output data-testid="page-count">{pagination.pageCount}</output>
		<Pagination.Next data-testid="next">Next</Pagination.Next>
	{/snippet}
</Pagination.Root>

<output data-testid="bound-page">{page}</output>
