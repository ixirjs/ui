<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { DialogBodyProps } from './types';
	import { DialogBond } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	let {
		class: klass,
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogBodyProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Body /> must be used within a <Dialog.Root />');

	const atom = bond.atom('body');

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['border-border px-4 py-2', '$preset', klass]}
	{...bodyProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
