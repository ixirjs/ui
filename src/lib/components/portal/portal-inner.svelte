<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { PortalBond, PortalInnerAtom } from './bond.svelte';
	import {
		mergeAtomProps,
		HtmlAtom,
		type ElementType,
		type HtmlAtomProps,
		type Base
	} from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';

	type Element = ElementType<E>;

	const bond = PortalBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: HtmlAtomProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = createAtomInstance<PortalInnerAtom, PortalBond, HTMLElement>('inner', {
		bond,
		factory: (owner) => new PortalInnerAtom(owner as PortalBond)
	});

	const bondProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<!--
	Teleport sink and floating-ui boundary. `relative size-full` makes it the offsetParent the
	teleported `absolute` overlays anchor against; no overflow clip keeps containment soft.
-->
<HtmlAtom {bond} class={['relative size-full', '$preset', klass]} {...bondProps}>
	{@render children?.()}
</HtmlAtom>
