<script lang="ts">
	import { Tooltip } from '@ixirjs/ui/components/tooltip';
	import { Button } from '@ixirjs/ui/components/button';
</script>

<div class="flex flex-col items-center justify-center gap-3 p-8">
	<Tooltip.Root>
		{#snippet children({ popover })}
			<Tooltip.Trigger base={Button} variant="outline">Hover me</Tooltip.Trigger>
			<Tooltip.Content
				class="border-border bg-popover text-popover-foreground z-50 rounded-md border px-3 py-1.5 text-sm shadow-md"
			>
				This is a tooltip
			</Tooltip.Content>
			<!-- Read the root-owned interface; no factory or manual teardown. -->
			<code class="text-muted-foreground block font-mono text-xs"
				>profile: {popover.profile.name} · open: {String(popover.isOpen)}</code
			>
		{/snippet}
	</Tooltip.Root>
</div>
