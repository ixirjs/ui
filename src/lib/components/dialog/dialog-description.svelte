<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { DialogDescriptionProps } from './types';
	import { DialogBond } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		as = 'p' as E,
		children = undefined,
		...restProps
	}: DialogDescriptionProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Description /> must be used within a <Dialog.Root />');

	const atom = bond.atom('description');

	const descriptionProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{as}
	class={['border-border', '$preset', klass]}
	{...descriptionProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
