<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import type { SlideoverContentProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { animateDrawerContent, type DrawerSide } from './motion';

	type Element = HTMLElementTagNameMap[E];

	const bond = DrawerBond.get();
	const isOpen = $derived(bond?.state.props.open);

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		fallback = {
			animate: animateDrawerContent({ }),
			initial: animateDrawerContent({ duration: 0 }),
		},
		...restProps
	}: SlideoverContentProps<E, B> & HTMLAttributes<Element> & { side?: DrawerSide } = $props();

	const atom = bond?.content();

	const contentProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<Atom
	class={[
		'bg-card text-foreground border-border pointer-events-none absolute',
		isOpen && 'pointer-events-auto',
		'$preset',
		klass
	]}
	{bond}
	{fallback}
	{...contentProps}
>
	{@render children?.({ drawer: bond })}
</Atom>
