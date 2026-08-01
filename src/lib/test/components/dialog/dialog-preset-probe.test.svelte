<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Dialog, type DialogPresets } from '$ixirjs/ui/components/dialog';

	let { presets }: { presets: DialogPresets } = $props();
</script>

<Root>
	<Dialog.Root open {presets}>
		{#snippet children()}
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Title</Dialog.Title>
					<Dialog.Close />
				</Dialog.Header>
				<Dialog.Description>Description</Dialog.Description>
				<Dialog.Body>Body</Dialog.Body>
				<Dialog.Footer>Footer</Dialog.Footer>
			</Dialog.Content>
		{/snippet}
	</Dialog.Root>
</Root>
