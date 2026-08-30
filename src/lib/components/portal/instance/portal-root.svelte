<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PortalOuterProps } from '$ixirjs/ui/components/portal/types';
	import { PortalsContext, ZLayer } from '..';
	import { PortalBond, PortalContext } from './bond.svelte';

	const ID = $props.id();

	let {
		as = undefined,
		base = undefined,
		id,
		factory = undefined,
		children = undefined,
		...restProps
	}: PortalOuterProps = $props();

	const portalsBond = PortalsContext.get();

	new ZLayer(0, () => 0, null).share();

	const bondProps = {
		get id() {
			return id ?? ID;
		}
	};
	const build = untrack(() => factory);
	const bond = PortalContext.share(build ? build(bondProps) : PortalBond.create(bondProps));

	const unregister = portalsBond?.registerPortal(
		untrack(() => id),
		bond
	);
	$effect(() => unregister);

	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'portal',
		class: 'portal-root pointer-events-none absolute inset-0',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => ({ id: bond.id })
	});
	const leaf = Kernel.render(el);
</script>

<!--
	Portal surface: an `absolute inset-0` layer rendered in place (not detached to <body>), so it
	scrolls and stacks with the host. `pointer-events-none` lets page clicks through (overlays opt
	back in).
-->
{@render leaf(el, children, { portal: bond })}
