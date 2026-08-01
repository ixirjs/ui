<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h2', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { DialogBond, DialogTitleAtom } from './bond.svelte';
	import type { DialogTitleProps } from './types';

	let {
		preset = undefined,
		as = 'h3' as E,
		children = undefined,
		...restProps
	}: DialogTitleProps<E, B> = $props();

	const bond = DialogBond.getOrThrow('<Dialog.Title /> must be used within a <Dialog.Root />');

	const atom = createAtomInstance<DialogTitleAtom, DialogBond, HTMLElement>('title', {
		bond,
		factory: (owner) => new DialogTitleAtom(owner as DialogBond)
	});

	const titleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {as} {bond} {...titleProps}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
