<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
	import type { DialogContentProps } from './types';
	import { animateDialogContent } from './motion.svelte';

	const bond = DialogBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		fallback={
			animate: animateDialogContent(),
		},
		...restProps
	}: DialogContentProps<E, B> = $props();

	const atom = bond?.content();

	const dialogProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<HtmlAtom
	class={[
		'bg-card text-foreground border-border flex h-fit w-full max-w-[90svw] flex-col rounded-md border py-4 shadow-sm opacity-0',
		'$preset',
		klass
	]}
	{bond}
	{fallback}
	{...dialogProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
