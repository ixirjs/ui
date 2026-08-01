<script lang="ts" module>
	import type { PopoverDialogBond } from '$ixirjs/ui/components/popover-dialog';

	export let capturedBond: PopoverDialogBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { PopoverDialog } from '$ixirjs/ui/components/popover-dialog';
	import { Root } from '$ixirjs/ui/components/root';

	function capture(bond: PopoverDialogBond): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<PopoverDialog.Root open={true}>
		{#snippet children({ popoverDialog })}
			{capture(popoverDialog)}
			<PopoverDialog.Dialog>
				{#snippet children()}
					<PopoverDialog.Content>
						<PopoverDialog.Header data-testid="popover-dialog-header"
							>Primary heading</PopoverDialog.Header
						>
						<PopoverDialog.Header data-testid="popover-dialog-header"
							>Secondary heading</PopoverDialog.Header
						>
						<PopoverDialog.Body data-testid="popover-dialog-body">First body</PopoverDialog.Body>
						<PopoverDialog.Body data-testid="popover-dialog-body">Second body</PopoverDialog.Body>
					</PopoverDialog.Content>
				{/snippet}
			</PopoverDialog.Dialog>
		{/snippet}
	</PopoverDialog.Root>
</Root>
