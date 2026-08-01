<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { ToastBond } from './bond.svelte';
	import type { ToastDescriptionProps } from './types';

	let {
		as = 'p' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ToastDescriptionProps<E, B> = $props();

	const bond = ToastBond.get();

	const atom = bond?.description();

	const descriptionProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{as}
	{bond}
	{...descriptionProps}
>
	{@render children?.({ toast: bond })}
</HtmlAtom>
