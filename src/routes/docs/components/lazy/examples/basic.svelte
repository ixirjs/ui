<script lang="ts">
	import { Lazy } from '$lib/components/lazy';

	const promise = import('$lib/components/badge/badge.svelte').then((m) => m.default);
</script>

<Lazy {promise}>
	{#snippet loading()}
		<span role="status" class="text-muted-foreground text-sm">Loading…</span>
	{/snippet}
	{#snippet error(reason)}
		<span role="alert" class="text-destructive text-sm">Failed: {reason}</span>
	{/snippet}
</Lazy>
