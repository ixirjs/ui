<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
	import type { DialogFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogFooterProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Footer /> must be used within a <Dialog.Root />');

	const atom = bond.atom('footer');

	const footerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['border-border', 'flex px-4', '$preset', klass]}
	{...footerProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
