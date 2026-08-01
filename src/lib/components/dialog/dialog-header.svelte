<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import type { DialogHeaderProps } from './types';
	import { DialogBond } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogHeaderProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Header /> must be used within a <Dialog.Root />');

	const atom = bond.atom('header');

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['border-border', 'flex w-full px-4 text-xl', '$preset', klass]}
	{...headerProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
