<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AccordionItemBond } from './bond.svelte';
	import type { AccordionItemHeaderProps } from './types';

	let {
		class: klass = '',
		as = 'button',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemHeaderProps<E, B> = $props();

	const bond = AccordionItemBond.get();

	const atom = bond?.atom('header');

	const headerProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
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
