<script lang="ts">
	import { Scrollable } from '$lib/components/scrollable';
	const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
</script>

<Scrollable.Root class="h-48 w-64 rounded-lg border">
	<Scrollable.Container>
		<Scrollable.Content>
			{#each items as item (item)}
				<div class="border-border border-b px-4 py-2 text-sm last:border-b-0">{item}</div>
			{/each}
		</Scrollable.Content>
	</Scrollable.Container>
	<Scrollable.Track orientation="vertical">
		<Scrollable.Thumb orientation="vertical" />
	</Scrollable.Track>
</Scrollable.Root>
