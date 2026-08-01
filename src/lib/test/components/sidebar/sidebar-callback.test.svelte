<script lang="ts">
	import SidebarRoot from '$ixirjs/ui/components/sidebar/sidebar-root.svelte';
	import { toggleSidebar } from '$ixirjs/ui/components/sidebar/attachments.svelte';
	import type { SidebarBond } from '$ixirjs/ui/components/sidebar/bond.svelte';
	import type { SidebarRootProps } from '$ixirjs/ui/components/sidebar/types';

	let { onopenchange = undefined }: Pick<SidebarRootProps, 'onopenchange'> = $props();
	let sidebarRoot: { getBond(): SidebarBond };

	export function getBond(): SidebarBond {
		return sidebarRoot.getBond();
	}
</script>

<SidebarRoot bind:this={sidebarRoot} {onopenchange}>
	{#snippet children()}
		<button data-testid="sidebar-attachment-toggle" {@attach toggleSidebar()}>Toggle</button>
	{/snippet}
</SidebarRoot>
