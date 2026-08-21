<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DEV } from 'esm-env';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TeleportProps } from '$ixirjs/ui/components/portal/types';
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base, type BasePropsOf } from '$ixirjs/ui/components/atom';
	import type { HtmlElementTagName, HtmlElementType } from '$ixirjs/ui/components/element';
	import { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
	import {
		describePortalTarget,
		PortalsBond,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal/registry';
	import { port } from './port';

	type Element = HtmlElementType<E>;

	let {
		portal,
		as,
		base,
		children,
		...restProps
	}: TeleportProps<E, B> & HTMLAttributes<Element> & BasePropsOf<B> = $props();

	const portalsBond = PortalsBond.get();
	const ambientPortal = $derived(PortalBond.get());

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

	// `{@attach}` is markup syntax; the seam takes a props object, so the attachment rides its own
	// key. Minted once per instance so the node is not re-ported on every invalidation.
	const teleportKey = createAttachmentKey();

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	// `base` keeps this on the escalating branch when a consumer passes one — the seam decides that,
	// rather than the call site committing to a component boundary either way.
	const el = Kernel.element(Kernel.static, () => ({
		[teleportKey]: teleport,
		as: as as E,
		base,
		...restProps
	}));
</script>

{@render (targetElement && portalBond ? teleported : undefined)?.()}

<!-- `portalBond!` is proven by the dispatch below, which renders this only when it is present;
     TypeScript narrowing does not cross into a snippet body. -->
{#snippet teleported()}
	{@render Kernel.render(el)(el, children, { portal: portalBond! })}
{/snippet}
