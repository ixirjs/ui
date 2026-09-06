<script lang="ts">
	import { DropdownMenu } from '@ixirjs/ui/components/dropdown-menu';
	import { Button } from '@ixirjs/ui/components/button';
</script>

<DropdownMenu.Root>
	{#snippet children({ popover })}
		<DropdownMenu.Trigger base={Button} variant="outline">Open Menu</DropdownMenu.Trigger>
		<DropdownMenu.Content class="border-border bg-background min-w-36 rounded-lg border shadow-lg">
			<DropdownMenu.Item>New File</DropdownMenu.Item>
			<DropdownMenu.Item>Open File</DropdownMenu.Item>
			<DropdownMenu.Item>Save</DropdownMenu.Item>
			<DropdownMenu.Item class="text-red-600">Exit</DropdownMenu.Item>
		</DropdownMenu.Content>
		<!-- Read the root-owned interface; no factory or manual teardown. -->
		<code class="text-muted-foreground block font-mono text-xs"
			>profile: {popover.profile.name} · open: {String(popover.isOpen)}</code
		>
	{/snippet}
</DropdownMenu.Root>
