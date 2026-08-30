<script lang="ts">
	import { DEV } from 'esm-env';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { TeleportProps } from '$ixirjs/ui/components/portal/types';
	import { PortalContext } from '$ixirjs/ui/components/portal/instance/bond.svelte';
	import {
		describePortalTarget,
		PortalsContext,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal/registry';
	import { port } from './port';

	let {
		portal,
		as = undefined,
		base = undefined,
		children,
		...restProps
	}: TeleportProps = $props();

	const portalsBond = PortalsContext.get();
	const ambientPortal = PortalContext.get();

	const portalBond = $derived(resolveTeleportTarget(portalsBond, portal, ambientPortal));

	const targetElement = $derived(portalBond?.boundaryElement);

	// Warn (in an effect, after registration settles) when no target element resolves.
	$effect(() => {
		if (DEV && !targetElement) {
			console.warn(
				`[ixirjs] <Teleport${describePortalTarget(portal)}>: no portal target resolved; nothing is teleported.`
			);
		}
	});

	function teleport(node: HTMLElement) {
		return port(node, targetElement);
	}

	// The attachment rides its own key, minted once so the node is not re-ported per invalidation.
	const teleportKey = createAttachmentKey();

	const el = Kernel.element(() => ({ [teleportKey]: teleport, ...restProps }), {
		class: '',
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render (targetElement && portalBond ? teleported : undefined)?.()}

<!-- `portalBond!` is proven by the dispatch above, which renders this only when it is present;
     TypeScript narrowing does not cross into a snippet body. -->
{#snippet teleported()}
	{@render leaf(el, children, { portal: portalBond! })}
{/snippet}
