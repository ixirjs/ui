<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h2', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
	import type { DialogTitleProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'h3' as E,
		children = undefined,
		...restProps
	}: DialogTitleProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Title /> must be used within a <Dialog.Root />');

	const atom = bond.atom('title');

	const titleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{as}
	{bond}
	class={['border-border', '$preset', klass]}
	{...titleProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
