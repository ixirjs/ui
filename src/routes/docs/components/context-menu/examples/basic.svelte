<script lang="ts">
	import { ContextMenu } from '@ixirjs/ui/components/context-menu';
</script>

<ContextMenu.Root>
	{#snippet children({ popover })}
		<ContextMenu.Trigger
			class="flex h-32 w-64 items-center justify-center rounded-lg border border-dashed p-4 text-sm bg-card/50"
		>
			Right-click this area
		</ContextMenu.Trigger>
		<ContextMenu.Content
			preset="context-menu.content"
			class="min-w-44 rounded-lg border bg-popover shadow-md p-0"
		>
			<ContextMenu.Item preset="context-menu.item" class="border-none">Copy</ContextMenu.Item>
			<ContextMenu.Item preset="context-menu.item" class="border-none">Paste</ContextMenu.Item>
			<ContextMenu.Divider />
			<ContextMenu.Item preset="context-menu.item" class="border-none text-destructive"
				>Delete</ContextMenu.Item
			>
		</ContextMenu.Content>
		<!-- Read the root-owned interface; no factory or manual teardown. -->
		<code class="text-muted-foreground block font-mono text-xs"
			>profile: {popover.profile.name} · open: {String(popover.isOpen)}</code
		>
	{/snippet}
</ContextMenu.Root>
