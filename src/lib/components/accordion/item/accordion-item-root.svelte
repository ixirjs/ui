<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { AccordionItemBond, type AccordionItemBondProps } from './bond.svelte';
	import type { AccordionItemRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		value,
		data = undefined,
		disabled = false,
		factory = defaultFactory,
		children = undefined,
		preset = undefined,
		presets = undefined,
		...restProps
	}: AccordionItemRootProps<E, B> = $props();

	const root = useRoot(
		AccordionItemBond,
		{
			data: () => data,
			disabled: () => disabled,
			value: () => value,
			presets: () => presets
		},
		{ preset: () => preset, id: () => ID, factory: (props) => factory(props) }
	);
	const bond = root.bond;

	function defaultFactory(props: AccordionItemBondProps) {
		return AccordionItemBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['border-border', '$preset', klass]} {...root.props} {...restProps} part={root}>
	{@render children?.({ accordionItem: bond })}
</HtmlAtom>
