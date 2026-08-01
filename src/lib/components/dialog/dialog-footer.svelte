<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { DialogBond, DialogFooterAtom } from './bond.svelte';
	import type { DialogFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogFooterProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Footer /> must be used within a <Dialog.Root />');

	const atom = createAtomInstance<DialogFooterAtom, DialogBond, HTMLElement>('footer', {
		bond,
		factory: (owner) => new DialogFooterAtom(owner as DialogBond)
	});

	const footerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} class={['flex px-4', '$preset', klass]} {...footerProps}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
