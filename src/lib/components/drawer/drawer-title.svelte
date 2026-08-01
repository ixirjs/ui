<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h3', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DrawerBond } from './bond.svelte';
	import type { SlideoverTitleProps } from './types';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.getOrThrow('<Drawer.Title /> must be used within a <Drawer.Root />');

	let {
		preset = undefined,
		as = 'h3' as E,
		children,
		...restProps
	}: SlideoverTitleProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond?.title();

	const titleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {as} {bond} {...titleProps}>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
