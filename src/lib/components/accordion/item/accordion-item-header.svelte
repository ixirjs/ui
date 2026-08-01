<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { AccordionItemBond, AccordionItemHeaderAtom } from './bond.svelte';
	import type { AccordionItemHeaderProps } from './types';

	let {
		class: klass = '',
		as = 'button',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemHeaderProps<E, B> = $props();

	const bond = AccordionItemBond.get();

	const atom = bond
		? createAtomInstance<AccordionItemHeaderAtom, AccordionItemBond>('header', {
				bond,
				factory: (owner) => new AccordionItemHeaderAtom(owner as AccordionItemBond).role('trigger')
			})
		: undefined;

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{as}
	{bond}
	class={[
		'border-border relative box-border flex w-full cursor-pointer items-center',
		'$preset',
		klass
	]}
	tabindex={as !== 'button' ? 0 : undefined}
	{...headerProps}
>
	{#if bond}
		{@render children?.({ accordionItem: bond })}
	{/if}
</HtmlAtom>
