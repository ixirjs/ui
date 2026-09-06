<script lang="ts">
	import { Popover } from '@ixirjs/ui/components/popover';
	import { Button } from '@ixirjs/ui/components/button';
</script>

<Popover.Root>
	{#snippet children({ popover })}
		<Popover.Trigger base={Button} variant="outline">Open Popover</Popover.Trigger>
		<Popover.Content class="border-border bg-background z-10 w-64 rounded-lg border p-4 shadow-lg">
			<p class="text-sm">This is a popover. It floats near its trigger element.</p>
		</Popover.Content>
		<!-- Read the root-owned interface; no factory or manual teardown. -->
		<code class="text-muted-foreground block font-mono text-xs"
			>profile: {popover.profile.name} · open: {String(popover.isOpen)}</code
		>
	{/snippet}
</Popover.Root>
