<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { AccordionItemBodyAtom, AccordionItemBond } from './bond.svelte';
	import { enterAccordionItemBody, exitAccordionItemBody } from './motion.svelte';
	import type { AccordionItemBodyProps } from './types';

	const bond = AccordionItemBond.get();
	const isOpen = $derived(bond?.isOpen ?? false);

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

	const atom = bond
		? createAtomInstance<AccordionItemBodyAtom, AccordionItemBond>('body', {
				bond,
				factory: (owner) => new AccordionItemBodyAtom(owner as AccordionItemBond).role('content')
			})
		: undefined;

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));

	const content = $derived(bond && isOpen ? body : undefined);
</script>

{#snippet body(accordionItem: AccordionItemBond)}
	<HtmlAtom
		bond={accordionItem}
		class={['border-border box-content h-0 opacity-0', '$preset', klass]}
		onmount={onmount?.bind(accordionItem)}
		ondestroy={ondestroy?.bind(accordionItem)}
		{fallback}
		{...bodyProps}
	>
		{@render children?.({ accordionItem })}
	</HtmlAtom>
{/snippet}

{@render content?.(bond!)}
