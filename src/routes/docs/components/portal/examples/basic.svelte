<script lang="ts">
	import { ActivePortal, Portal } from '$lib/components/portal';

	// A portal is a place, named by an id. `Outer` renders the surface in position, `Inner` is
	// where teleported content lands, and `ActivePortal` makes it the default target for anything
	// nested inside — which is how Dialog, Drawer and Popover find a surface without being told.
	const id = 'docs-example-portal';
</script>

<div class="border-border relative rounded-lg border p-4">
	<Portal.Outer {id}>
		<Portal.Inner />
	</Portal.Outer>

	<ActivePortal portal={id}>
		<p class="text-sm">Overlays opened in here mount to the surface above, not to the body.</p>
	</ActivePortal>
</div>
