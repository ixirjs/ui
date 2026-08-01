<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { PortalOuterProps } from '$ixirjs/ui/components/portal/types';
	import { PortalsBond, PortalBond, ZLayer } from '..';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { useRoot } from '$ixirjs/ui/shared';
	import type { Factory } from '$ixirjs/ui/types';
	import type { PortalBondProps } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		id,
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: PortalOuterProps<E, B> = $props();

	function defaultFactory(props: PortalBondProps): PortalBond {
		return PortalBond.create(props);
	}

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
		{ preset: () => preset, factory: (props) => (factory as Factory<PortalBond>)(props) }
	);
	const bond = root.bond;

	// Eager register so descendants (e.g. ActivePortal) resolve this portal within the same render;
	// `id` is read once at init.
	// svelte-ignore state_referenced_locally
	const unregister = portalsBond?.registerPortal(id, bond);

	$effect(() => unregister);

	export function getBond() {
		return bond;
	}
</script>

<!--
	Portal surface: an `absolute inset-0` layer rendered in place (not detached to <body>), so it
	scrolls and stacks with the host. `pointer-events-none` lets page clicks through (overlays opt
	back in).
-->
<HtmlAtom
	class={['portal-root pointer-events-none absolute inset-0', '$preset', klass]}
	{...root.props}
	{...restProps}
	part={root}
>
	{@render children?.()}
</HtmlAtom>
