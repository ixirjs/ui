<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { DEV } from 'esm-env';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TeleportProps } from './types';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { HtmlElementTagName, HtmlElementType } from '$svelte-atoms/core/components/element';
	import { PortalsBond, resolvePortal } from './portals';
	import { port } from './port';

	type Element = HtmlElementType<E>;

	let { portal, as, base, children, ...restProps }: TeleportProps<E, B> & HTMLAttributes<Element> =
		$props();

	const portalsBond = PortalsBond.get();

	const portalBond = $derived(resolvePortal(portalsBond, portal));

	const targetElement = $derived(portalBond?.boundaryElement);

	const ui = $derived(targetElement ? content : undefined);

	// Warn (in an effect, after registration settles) when a string id never resolves.
	$effect(() => {
		if (DEV && typeof portal === 'string' && !portalBond) {
			console.warn(
				`[svelte-atoms] <Teleport portal="${portal}">: no portal registered with this id; nothing is teleported.`
			);
		}
	});

	function teleport(node: HTMLElement) {
		return port(node, targetElement);
	}
</script>

{#snippet content()}
	<HtmlAtom {@attach teleport} as={as as E} {base} {...restProps}>
		{#if portalBond}
			{@render children?.({ portal: portalBond })}
		{/if}
	</HtmlAtom>
{/snippet}

{@render ui?.()}
