<script lang="ts">
	import { Tooltip } from '$lib/components/tooltip';
	import { Button } from '$lib/components/button';

	const placements = ['top', 'bottom', 'left', 'right'] as const;
</script>

<div class="flex flex-wrap items-center justify-center gap-4 p-8">
	{#each placements as placement, i (i)}
		<Tooltip.Root {placement}>
			<Tooltip.Trigger base={Button} variant="outline">{placement}</Tooltip.Trigger>
			<Tooltip.Content
				class="border-border bg-popover text-popover-foreground z-50 rounded-md border px-3 py-1.5 text-sm shadow-md"
			>
				{placement} tooltip
			</Tooltip.Content>
		</Tooltip.Root>
	{/each}
</div>
