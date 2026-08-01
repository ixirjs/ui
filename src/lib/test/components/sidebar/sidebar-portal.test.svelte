<script lang="ts">
	import { Portal, Portals } from '$ixirjs/ui/components/portal';
	import SidebarRoot from '$ixirjs/ui/components/sidebar/sidebar-root.svelte';
</script>

<Portals id="root">
	<Portal.Outer id="root.l0">
		<Portal.Inner />
	</Portal.Outer>

	<SidebarRoot overlay open portal="root.l0">
		{#snippet children()}
			<div class="sidebar-portal-probe">Sidebar</div>
		{/snippet}
	</SidebarRoot>
</Portals>
