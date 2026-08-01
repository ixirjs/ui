<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { animate as motion } from 'motion';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import IconArrowDown from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { AccordionItemBond, AccordionItemIndicatorAtom } from './bond.svelte';
	import type { AccordionItemIndicatorProps } from './types';

	const bond = AccordionItemBond.get();
	const isOpen = $derived(bond?.isOpen ?? false);

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemIndicatorProps<E, B> = $props();

	const atom = bond
		? createAtomInstance<AccordionItemIndicatorAtom, AccordionItemBond>('indicator', {
				bond,
				factory: (owner) => new AccordionItemIndicatorAtom(owner as AccordionItemBond)
			})
		: undefined;

	const indicatorProps = $derived(mergeAtomProps(atom, preset, restProps));

	function _animate(node: HTMLElement) {
		return motion(node, { rotate: 180 * +isOpen }, { duration: 0.3, ease: 'anticipate' });
	}
</script>

<HtmlAtom
	animate={_animate}
	class={['border-border pointer-events-none flex items-center justify-center', '$preset', klass]}
	{...indicatorProps}
>
	{#if children && bond}
		{@render children({ accordionItem: bond })}
	{:else}
		<Icon src={IconArrowDown} />
	{/if}
</HtmlAtom>
