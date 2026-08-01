<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AccordionItemBond } from './bond.svelte';
	import { enterAccordionItemBody, exitAccordionItemBody } from './motion.svelte';
	import type { AccordionItemBodyProps } from './types';

	const bond = AccordionItemBond.get();
	const isOpen = $derived(bond?.state.isOpen ?? false);

	let {
		class: klass = '',
		children = undefined,
		onmount = undefined,
		ondestroy = undefined,
		fallback = {
			enter: enterAccordionItemBody(),
			exit: exitAccordionItemBody()
		},
		preset = undefined,
		...restProps
	}: AccordionItemBodyProps<E, B> = $props();

	const atom = bond?.atom('body');

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));

	const content = $derived(bond && isOpen ? body: undefined);
</script>

{#snippet body(accordionItem: AccordionItemBond)}
	<HtmlAtom
		bond={accordionItem}
		class={['border-border box-content h-0 opacity-0', '$preset', klass]}
		onmount={onmount?.bind(accordionItem.state)}
		ondestroy={ondestroy?.bind(accordionItem.state)}
		{fallback}
		{...bodyProps}
	>
		{@render children?.({ accordionItem })}
	</HtmlAtom>
{/snippet}

{@render content?.(bond!)}
