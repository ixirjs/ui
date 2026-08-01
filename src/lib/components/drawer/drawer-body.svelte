<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { DrawerBodyProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	type Element = HTMLElementTagNameMap[E];

	let {
		preset = undefined,
		children = undefined,
		...restProps
	}: DrawerBodyProps<E, B> & HTMLAttributes<Element> = $props();

	const bond = DrawerBond.getOrThrow('<Drawer.Body /> must be used within a <Drawer.Root />');

	const atom = bond?.body();

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} {...bodyProps}>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
