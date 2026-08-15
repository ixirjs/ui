<script lang="ts">
	import { Pagination } from '$lib/components/pagination';

	let page = $state(1);
</script>

<Pagination.Root bind:page pageSize={10} total={95} aria-label="Search results">
	<div class="flex items-center gap-3">
		<Pagination.Previous>Previous</Pagination.Previous>
		<span aria-live="polite" class="text-sm">Page {page} of 10</span>
		<Pagination.Next>Next</Pagination.Next>
	</div>
</Pagination.Root>
