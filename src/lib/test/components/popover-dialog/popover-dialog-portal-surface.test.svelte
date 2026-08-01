<script lang="ts">
	import { PopoverDialog } from '$ixirjs/ui/components/popover-dialog';
	import { Portal } from '$ixirjs/ui/components/portal';
	import { Root } from '$ixirjs/ui/components/root';

	let { firstOpen = true, secondOpen = true }: { firstOpen?: boolean; secondOpen?: boolean } =
		$props();
</script>

<Root>
	<Portal.Outer id="local">
		<Portal.Inner data-testid="popover-dialog-local-sink" />
	</Portal.Outer>

	<PopoverDialog.Root open={firstOpen}>
		<PopoverDialog.Dialog portal="local" data-testid="popover-dialog-first">
			{#snippet children()}
				<PopoverDialog.Content>first</PopoverDialog.Content>
			{/snippet}
		</PopoverDialog.Dialog>
	</PopoverDialog.Root>

	<PopoverDialog.Root open={secondOpen}>
		<PopoverDialog.Dialog portal="local" data-testid="popover-dialog-second">
			{#snippet children()}
				<PopoverDialog.Content>second</PopoverDialog.Content>
			{/snippet}
		</PopoverDialog.Dialog>
	</PopoverDialog.Root>
</Root>
