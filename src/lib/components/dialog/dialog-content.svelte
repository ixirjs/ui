<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { PortalHost } from '$svelte-atoms/core/components/portal/host';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { DialogBond, DialogContentAtom } from './bond.svelte';
	import type { DialogContentProps } from './types';
	import { animateDialogContent } from './motion.svelte';

	const bond = DialogBond.getOrThrow('<Dialog.Content /> must be used within a <Dialog.Root />');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		fallback = {
			animate: animateDialogContent()
		},
		...restProps
	}: DialogContentProps<E, B> = $props();

	const atom = createAtomInstance<DialogContentAtom, DialogBond, HTMLElement>('content', {
		bond,
		factory: (owner) => new DialogContentAtom(owner as DialogBond)
	});

	const dialogProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<PortalHost
	class={[
		'bg-card text-foreground flex h-fit w-full max-w-[90svw] flex-col rounded-md border py-4 shadow-sm opacity-0',
		'$preset',
		klass
	]}
	{bond}
	{fallback}
	{...dialogProps}
>
	{@render children?.({ dialog: bond })}
</PortalHost>
