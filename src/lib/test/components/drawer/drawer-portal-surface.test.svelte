<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Portal } from '$ixirjs/ui/components/portal';
	import DrawerRoot from '$ixirjs/ui/components/drawer/drawer-root.svelte';
	import type { DrawerBond } from '$ixirjs/ui/components/drawer/bond.svelte';

	let { firstOpen = true, secondOpen = true }: { firstOpen?: boolean; secondOpen?: boolean } =
		$props();
	let firstDrawer: { getBond(): DrawerBond };

	export function getFirstBond(): DrawerBond {
		return firstDrawer.getBond();
	}
</script>

<Root>
	<Portal.Outer id="local">
		<Portal.Inner data-testid="drawer-local-sink" />
	</Portal.Outer>

	<DrawerRoot
		portal="local"
		position="absolute"
		side="left"
		bind:this={firstDrawer}
		open={firstOpen}
		data-testid="drawer-first"
	>
		{#snippet children()}first{/snippet}
	</DrawerRoot>
	<DrawerRoot portal="local" side="right" open={secondOpen} data-testid="drawer-second">
		{#snippet children()}second{/snippet}
	</DrawerRoot>
</Root>
