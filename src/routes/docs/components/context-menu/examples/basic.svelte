<script lang="ts">
	import { ContextMenu } from '$lib/components/context-menu';
</script>

<ContextMenu.Root>
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
</ContextMenu.Root>
