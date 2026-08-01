<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Drawer, type DrawerPresets } from '$ixirjs/ui/components/drawer';

	let { presets }: { presets: DrawerPresets } = $props();
</script>

<Root>
	<Drawer.Root open {presets}>
		{#snippet children()}
			<Drawer.Backdrop />
			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title>Title</Drawer.Title>
				</Drawer.Header>
				<Drawer.Description>Description</Drawer.Description>
				<Drawer.Body>Body</Drawer.Body>
				<Drawer.Footer>Footer</Drawer.Footer>
			</Drawer.Content>
		{/snippet}
	</Drawer.Root>
</Root>
