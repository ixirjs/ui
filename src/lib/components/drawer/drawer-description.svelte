<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SlideoverDescriptionProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.get();

	let {
		preset = undefined,
		as = 'p' as E,
		children,
		...restProps
	}: SlideoverDescriptionProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond?.description();

	const descriptionProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<HtmlAtom
	{as}
	{bond}
	{...descriptionProps}
>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
