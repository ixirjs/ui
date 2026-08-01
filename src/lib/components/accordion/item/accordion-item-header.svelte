<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AccordionItemBond } from './bond.svelte';
	import type { AccordionItemHeaderProps } from './types';

	let {
		class: klass = '',
		as = 'button',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemHeaderProps<E, B> = $props();

	const part = usePart(AccordionItemBond, 'header', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom
	{as}
	class={[
		'border-border relative box-border flex w-full cursor-pointer items-center',
		'$preset',
		klass
	]}
	tabindex={as !== 'button' ? 0 : undefined}
	{...restProps}
	{part}
>
	{#if bond}
		{@render children?.({ accordionItem: bond })}
	{/if}
</HtmlAtom>
