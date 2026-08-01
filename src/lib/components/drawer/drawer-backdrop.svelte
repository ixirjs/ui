<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SlideoverBackdropProps } from './types';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DrawerBond } from './bond.svelte';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.get();

	let {
		class: klass = '',
		preset = undefined,
		...restProps
	}: SlideoverBackdropProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond?.backdrop();

	const backdropProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['border-border absolute inset-0 bg-black/30', '$preset', klass]}
	{...backdropProps}
/>
