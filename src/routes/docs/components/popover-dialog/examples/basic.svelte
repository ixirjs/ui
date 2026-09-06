<script lang="ts">
	import { PopoverDialog } from '@ixirjs/ui/components/popover-dialog';
	import { Button } from '@ixirjs/ui/components/button';
</script>

<PopoverDialog.Root>
	{#snippet children({ popoverDialog })}
		<PopoverDialog.Trigger base={Button} variant="outline">Open dialog</PopoverDialog.Trigger>
		<!-- Dialog owns the portalled modal surface; Content is its inner presentation. -->
		<PopoverDialog.Dialog aria-label="Project details">
			<PopoverDialog.Content class="w-80">
				<PopoverDialog.Header>Project details</PopoverDialog.Header>
				<PopoverDialog.Body
					><p>A Popover trigger opens this focus-managed modal.</p></PopoverDialog.Body
				>
				<PopoverDialog.Footer
					><PopoverDialog.CloseButton>Close</PopoverDialog.CloseButton></PopoverDialog.Footer
				>
			</PopoverDialog.Content>
		</PopoverDialog.Dialog>
		<!-- Read the root-owned interface; no factory or manual teardown. -->
		<code class="text-muted-foreground block font-mono text-xs"
			>profile: {popoverDialog.profile.name} · open: {String(popoverDialog.isOpen)}</code
		>
	{/snippet}
</PopoverDialog.Root>
