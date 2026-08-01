<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import DrawerRoot from '$ixirjs/ui/components/drawer/drawer-root.svelte';
	import { closeDrawer } from '$ixirjs/ui/components/drawer/attachments.svelte';
	import type { DrawerBond } from '$ixirjs/ui/components/drawer/bond.svelte';
	import type { SlideoverRootProps } from '$ixirjs/ui/components/drawer/types';

	type Props = Pick<SlideoverRootProps<'dialog'>, 'open' | 'onclose' | 'onopenchange'>;

	let { open = true, onclose = undefined, onopenchange = undefined }: Props = $props();
	let drawerRoot: { getBond(): DrawerBond };

	export function getBond(): DrawerBond {
		return drawerRoot.getBond();
	}
</script>

<Root>
	<DrawerRoot bind:this={drawerRoot} {open} {onclose} {onopenchange}>
		{#snippet children()}
			<button data-testid="drawer-attachment-close" {@attach closeDrawer()}>Close</button>
		{/snippet}
	</DrawerRoot>
</Root>
