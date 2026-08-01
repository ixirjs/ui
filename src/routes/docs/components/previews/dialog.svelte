<script lang="ts">
	import { Button } from '$lib/components/button';
	import { Dialog } from '$lib/components/dialog';

	// Dialog is controlled — drive it with `bind:open` and your own trigger.
	let open = $state(false);
</script>

<Button size="sm" variant="outline" onclick={() => (open = true)}>Open Dialog</Button>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<h2 class="text-foreground text-base font-semibold">Edit Profile</h2>
			<Dialog.CloseButton class="ml-auto" />
		</Dialog.Header>
		<Dialog.Body class="text-muted-foreground text-sm py-2">
			Make changes to your profile here. Click save when you're done.
		</Dialog.Body>
		<Dialog.Footer class="flex justify-end gap-2">
			<Button variant="outline" size="sm" onclick={() => (open = false)}>Cancel</Button>
			<Button size="sm" onclick={() => (open = false)}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
