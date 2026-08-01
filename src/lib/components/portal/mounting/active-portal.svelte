<script lang="ts">
	import { DEV } from 'esm-env';
	import type { ActivePortalProps } from '$ixirjs/ui/components/portal/types';
	import { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
	import {
		describePortalTarget,
		PortalsBond,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal/registry';

	let { portal, children }: ActivePortalProps = $props();

	const portalsBond = PortalsBond.get();
	const ambientPortal = $derived(PortalBond.get());

	const activePortal = $derived(resolveTeleportTarget(portalsBond, portal, ambientPortal));

	// Warn (in an effect, after registration settles) when no portal resolves.
	$effect(() => {
		if (DEV && !activePortal) {
			console.warn(
				`[ixirjs] <ActivePortal${describePortalTarget(portal)}>: no portal target resolved; rendering nothing.`
			);
		}
	});

	function proxy(...args: []): ReturnType<NonNullable<typeof children>> | undefined {
		activePortal?.share();
		return children?.(...args);
	}
</script>

{@render (activePortal ? proxy : undefined)?.()}
