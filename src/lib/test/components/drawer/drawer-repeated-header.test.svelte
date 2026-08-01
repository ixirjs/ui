<script lang="ts" module>
	import type { DrawerBond } from '$ixirjs/ui/components/drawer';

	export let capturedBond: DrawerBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Drawer } from '$ixirjs/ui/components/drawer';
	import { Root } from '$ixirjs/ui/components/root';

	function capture(bond: DrawerBond): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<Drawer.Root open={true}>
		{#snippet children({ drawer })}
			{capture(drawer)}
			<Drawer.Content>
				<Drawer.Header data-testid="drawer-header">Primary heading</Drawer.Header>
				<Drawer.Header data-testid="drawer-header">Secondary heading</Drawer.Header>
				<Drawer.Body data-testid="drawer-body">First body</Drawer.Body>
				<Drawer.Body data-testid="drawer-body">Second body</Drawer.Body>
			</Drawer.Content>
		{/snippet}
	</Drawer.Root>
</Root>
