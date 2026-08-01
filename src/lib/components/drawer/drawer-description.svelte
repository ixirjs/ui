<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SlideoverDescriptionProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.getOrThrow(
		'<Drawer.Description /> must be used within a <Drawer.Root />'
	);

	let {
		preset = undefined,
		as = 'p' as E,
		children,
		...restProps
	}: SlideoverDescriptionProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond?.description();

	const descriptionProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {as} {bond} {...descriptionProps}>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
