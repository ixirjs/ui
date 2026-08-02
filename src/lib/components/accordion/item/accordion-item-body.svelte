<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AccordionItemBond } from './bond.svelte';
	import { enterAccordionItemBody, exitAccordionItemBody } from './motion.svelte';
	import type { AccordionItemBodyProps } from './types';

	let {
		class: klass = '',
		children = undefined,
		onmount = undefined,
		ondestroy = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemBodyProps<E, B> = $props();

	const defaults = {
		enter: enterAccordionItemBody(),
		exit: exitAccordionItemBody()
	};

	const part = usePart(AccordionItemBond, 'body', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
	const isOpen = $derived(bond.isOpen ?? false);
	const content = $derived(isOpen ? body : undefined);
</script>

{@render content?.(bond!)}

{#snippet body(accordionItem: AccordionItemBond)}
	<HtmlAtom
		bond={accordionItem}
		class={['box-content h-0 opacity-0', '$preset', klass]}
		onmount={onmount?.bind(accordionItem)}
		ondestroy={ondestroy?.bind(accordionItem)}
		{defaults}
		{...restProps}
		{part}
	>
		{@render children?.({ accordionItem })}
	</HtmlAtom>
{/snippet}
