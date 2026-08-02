<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { animate } from '$ixirjs/ui/shared';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AccordionItemBond } from './bond.svelte';
	import type { AccordionItemIndicatorProps } from './types';

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemIndicatorProps<E, B> = $props();

	const part = usePart(AccordionItemBond, 'indicator', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
	const isOpen = $derived(bond.isOpen ?? false);

	function _animate(node: HTMLElement) {
		return animate(node, { rotate: 180 * +isOpen }, { duration: 0.3, ease: 'anticipate' });
	}
</script>

<HtmlAtom
	animate={_animate}
	class={['border-border pointer-events-none flex items-center justify-center', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render (children && bond ? consumerIndicator : defaultIndicator)()}
</HtmlAtom>

<!-- `bond!` is proven by the dispatch above; narrowing does not cross into a snippet body. -->
{#snippet consumerIndicator()}
	{@render children?.({ accordionItem: bond! })}
{/snippet}

{#snippet defaultIndicator()}
	<Icon src={IconArrowDown} />
{/snippet}
