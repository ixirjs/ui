<script lang="ts">
	import { PopoverDialog, type PopoverDialogPresets } from '$ixirjs/ui/components/popover-dialog';
	import { Root } from '$ixirjs/ui/components/root';

	let { presets }: { presets: PopoverDialogPresets } = $props();
</script>

<Root>
	<PopoverDialog.Root open {presets}>
		<PopoverDialog.Trigger>Open</PopoverDialog.Trigger>
		<PopoverDialog.Dialog>
			{#snippet children()}
				<PopoverDialog.Content>
					<PopoverDialog.Header>
						<PopoverDialog.CloseButton />
					</PopoverDialog.Header>
					<PopoverDialog.Body>Body</PopoverDialog.Body>
				</PopoverDialog.Content>
			{/snippet}
		</PopoverDialog.Dialog>
	</PopoverDialog.Root>
</Root>
