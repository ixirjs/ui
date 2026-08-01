<script lang="ts">
	import { ContextMenu } from '$lib/components/context-menu';
	import { Button } from '$lib/components/button';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger base={Button} variant="secondary">Right-click button</ContextMenu.Trigger>
	<ContextMenu.Content
		preset="context-menu.content"
		class="min-w-44 rounded-lg border bg-popover shadow-md p-0"
	>
		<ContextMenu.Item preset="context-menu.item" class="border-none">Open</ContextMenu.Item>
		<ContextMenu.Item preset="context-menu.item" class="border-none">Rename</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
