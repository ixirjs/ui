<script lang="ts" generics="E extends keyof HTMLElementTagNameMap='div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SlideoverFooterProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.get();

	let {
		preset = undefined,
		children = undefined,
		...restProps
	}: SlideoverFooterProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond?.footer();

	const footerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	{...footerProps}
>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
