<script lang="ts">
	import { PopoverDialog } from '$lib/components/popover-dialog';
	import { Button } from '$lib/components/button';
</script>

<PopoverDialog.Root>
	<PopoverDialog.Trigger>
		{#snippet children()}
			<Button>Open</Button>
		{/snippet}
	</PopoverDialog.Trigger>
	<PopoverDialog.Content class="w-64 p-4">
		<PopoverDialog.Body>
			<p class="text-sm">A popover here, a modal dialog on a small screen.</p>
		</PopoverDialog.Body>
	</PopoverDialog.Content>
</PopoverDialog.Root>
