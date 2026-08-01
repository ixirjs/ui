<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SlideoverHeaderProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.get();

	let {
		preset = undefined,
		children = undefined,
		...restProps
	}: SlideoverHeaderProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond?.header();

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	{...headerProps}
>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
