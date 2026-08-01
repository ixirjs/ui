<script lang="ts">
	import { Dialog } from '$lib/components/dialog';
	import { Button } from '$lib/components/button';

	// Dialog is controlled via the `open` prop. For a built-in trigger, use PopoverDialog.
	let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open Dialog</Button>
<Dialog.Root bind:open>
	{#snippet children({ dialog })}
		<Dialog.Content>
			<Dialog.Header>
				<h2 class="text-foreground text-lg font-semibold">Edit Profile</h2>
				<Dialog.CloseButton class="ml-auto" />
			</Dialog.Header>
			<Dialog.Body class="text-muted-foreground text-sm">
				<p>Make changes to your profile here. Click save when you're done.</p>
			</Dialog.Body>
			<Dialog.Footer class="flex justify-end gap-2">
				<Button variant="outline" onclick={() => dialog.state.close()}>Cancel</Button>
				<Button onclick={() => dialog.state.close()}>Save changes</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/snippet}
</Dialog.Root>
