<script lang="ts">
	import { Popover } from '$lib/components/popover';
	import { Button } from '$lib/components/button';
</script>

<div class="flex flex-wrap gap-4">
	{#each ['top', 'bottom', 'left', 'right'] as placement, i (i)}
		<Popover.Root>
			<Popover.Trigger base={Button} variant="outline" size="sm">{placement}</Popover.Trigger>
			<Popover.Content
				{placement}
				class="border-border bg-background z-10 rounded-lg border p-3 shadow-lg"
			>
				<p class="text-sm">Placed on {placement}</p>
			</Popover.Content>
		</Popover.Root>
	{/each}
</div>
