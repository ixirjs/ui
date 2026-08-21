<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { PortalOuterProps } from '$ixirjs/ui/components/portal/types';
	import { PortalsBond, PortalBond, ZLayer } from '..';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { useRoot } from '$ixirjs/ui/shared';
	import type { Factory } from '$ixirjs/ui/types';

	let {
		class: klass = '',
		preset = undefined,
		id,
		factory = undefined,
		children = undefined,
		...restProps
	}: PortalOuterProps<E, B> = $props();

	const portalsBond = PortalsBond.get();

	// A Portal takes its identity from the consumer, but the fallback has to stay SSR-deterministic:
	// without a seed the Bond falls back to `generateId()`, a counter that keeps incrementing across
	// requests in a server process, so an unnamed Portal rendered `ix47` on the server and `ix1` on
	// hydration. The cell stays enumerable because a consumer's `id` really can change.
	const ID = $props.id();

	// Published before the Portal Bond so descendants see a complete context in one pass; the two
	// use different context keys and do not depend on each other's order.
	new ZLayer(0, () => 0, null).share();

	const root = useRoot(
		PortalBond,
		{
			id: () => id ?? ID
		},
		{ preset: () => preset, factory: () => factory as Factory<PortalBond> | undefined }
	);
	const bond = root.bond;

	// Eager register so descendants (e.g. ActivePortal) resolve this portal within the same render;
	// `id` is read once at init.
	// svelte-ignore state_referenced_locally
	const unregister = portalsBond?.registerPortal(id, bond);

	$effect(() => unregister);

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['portal-root pointer-events-none absolute inset-0', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

<!--
	Portal surface: an `absolute inset-0` layer rendered in place (not detached to <body>), so it
	scrolls and stacks with the host. `pointer-events-none` lets page clicks through (overlays opt
	back in).
-->
{@render Kernel.render(el)(el, children)}
