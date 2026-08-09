<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { AccordionItemBond } from './bond.svelte';
	const PART = Kernel.part(AccordionItemBond, 'body', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { enterAccordionItemBody, exitAccordionItemBody } from './motion.svelte';
	import type { AccordionItemBodyProps } from './types';

	let {
		class: klass = '',
		children = undefined,
		onmount = undefined,
		ondestroy = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemBodyProps<E, B> & BasePropsOf<B> = $props();

	const defaults = {
		enter: enterAccordionItemBody(),
		exit: exitAccordionItemBody()
	};

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;
	const isOpen = $derived(bond.isOpen ?? false);
	const content = $derived(isOpen ? body : undefined);

	// Real `enter`/`exit` phases route directly to a transition leaf.
	//
	// `onmount`/`ondestroy` are spread conditionally: setting the keys unconditionally (even to
	// `undefined`) used to route the part to a renderer, because the escalation test read key
	// presence rather than value.
	const el = Kernel.element(
		{ atom: part.atom, bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			class: ['box-content h-0 opacity-0', '$preset', klass],
			...(onmount ? { onmount: onmount.bind(bond) } : {}),
			...(ondestroy ? { ondestroy: ondestroy.bind(bond) } : {}),
			defaults,
			...restProps
		})
	);
</script>

{@render content?.(bond!)}

{#snippet body(accordionItem: AccordionItemBond)}
	{@render Kernel.render(el)(
		el.tag(),
		el.class(),
		el.attrs(),
		children,
		{ accordionItem },
		el.motion(),
		el
	)}
{/snippet}
