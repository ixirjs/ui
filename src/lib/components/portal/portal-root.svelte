<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PortalOuterProps } from './types';
	import { PortalsBond, PortalBond, PortalRootAtom, ZLayer } from '.';
	import {
		HtmlAtom,
		mergeAtomProps,
		type ElementType,
		type Base
	} from '$svelte-atoms/core/components/atom';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import type { Factory } from '$svelte-atoms/core/types';
	import type { PortalBondProps } from './bond.svelte';

	type Element = ElementType<E>;

	let {
		class: klass = '',
		preset = undefined,
		id,
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: PortalOuterProps<E, B> & HTMLAttributes<Element> = $props();

	function defaultFactory(props: PortalBondProps): PortalBond {
		return PortalBond.create(props);
	}

	const portalsBond = PortalsBond.get();

	const binding = bindBond<PortalBond>(
		(props) => (factory as Factory<PortalBond>)(props),
		{
			id: () => id
		},
		{ preset: () => preset }
	);

	new ZLayer(0, () => 0, null).share();

	const bond = binding.bond.share();

	const atom = createAtomInstance<PortalRootAtom, PortalBond, HTMLElement>('root', {
		bond,
		factory: (owner) => new PortalRootAtom(owner as PortalBond)
	});

	const rootProps = $derived(mergeAtomProps(atom, preset, restProps));

	// Eager register so descendants (e.g. ActivePortal) resolve this portal within the same render;
	// `id` is read once at init.
	// svelte-ignore state_referenced_locally
	const unregister = portalsBond?.registerPortal(id, bond);

	$effect(() => {
		return () => {
			unregister?.();
			bond.destroy();
		};
	});

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
	{...binding.stateProps}
	{...rootProps}
>
	{@render children?.()}
</HtmlAtom>
