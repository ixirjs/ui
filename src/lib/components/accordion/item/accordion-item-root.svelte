<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import {
		AccordionItemBond,
		AccordionItemBondState,
		type AccordionItemBondProps
	} from './bond.svelte';
	import type { AccordionItemRootProps } from './types';

	let {
		class: klass = '',
		value,
		data = undefined,
		disabled = false,
		factory = defaultFactory,
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemRootProps<E, B> = $props();

	const binding = bindBond<AccordionItemBond>(
		(props) => factory(props),
		{
			data: () => data,
			disabled: () => disabled,
			value: () => value
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	function defaultFactory(props: AccordionItemBondProps) {
		const accordionItemState = new AccordionItemBondState(props);
		return new AccordionItemBond(accordionItemState);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['border-border', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ accordionItem: bond })}
</HtmlAtom>
