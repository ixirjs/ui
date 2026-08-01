<script lang="ts">
	import { Stack } from '$lib/components/stack';
</script>

<Stack.Root direction="grid" columns={3} class="gap-3">
	{#each Array.from({ length: 6 }, (_, i) => `Cell ${i + 1}`) as cell, i (i)}
		<Stack.Item value={String(i)} class="border-border rounded border p-3 text-center text-sm"
			>{cell}</Stack.Item
		>
	{/each}
</Stack.Root>
