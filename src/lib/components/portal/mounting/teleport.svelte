<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { DEV } from 'esm-env';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TeleportProps } from '$ixirjs/ui/components/portal/types';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { HtmlElementTagName, HtmlElementType } from '$ixirjs/ui/components/element';
	import { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
	import {
		describePortalTarget,
		PortalsBond,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal/registry';
	import { port } from './port';

	type Element = HtmlElementType<E>;

	let { portal, as, base, children, ...restProps }: TeleportProps<E, B> & HTMLAttributes<Element> =
		$props();

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
</script>

{#if targetElement && portalBond}
	<HtmlAtom {@attach teleport} as={as as E} {base} {...restProps}>
		{@render children?.({ portal: portalBond })}
	</HtmlAtom>
{/if}
