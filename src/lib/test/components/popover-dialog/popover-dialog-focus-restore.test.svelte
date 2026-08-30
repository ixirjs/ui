<script lang="ts">
	// Focus restoration is the slot the fusion resolved in Dialog's favour: a popover restores focus
	// to its trigger, a modal restores it to whatever was focused before it opened. The outside
	// button is what tells the two apart.
	import { PopoverDialog } from '$ixirjs/ui/components/popover-dialog';
	import { Root } from '$ixirjs/ui/components/root';

	let { open = false }: { open?: boolean } = $props();
</script>

<Root>
	<button type="button" data-testid="popover-dialog-outside">outside</button>
	<PopoverDialog.Root {open}>
		<PopoverDialog.Trigger data-testid="popover-dialog-trigger">Open</PopoverDialog.Trigger>
		<PopoverDialog.Dialog data-testid="popover-dialog-surface">
			{#snippet children()}
				<PopoverDialog.Content data-testid="popover-dialog-content">
					<PopoverDialog.Header>Heading</PopoverDialog.Header>
					<PopoverDialog.CloseButton data-testid="popover-dialog-close" />
				</PopoverDialog.Content>
			{/snippet}
		</PopoverDialog.Dialog>
	</PopoverDialog.Root>
</Root>
