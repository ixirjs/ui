<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { AccordionItemBond } from './bond.svelte';
	import type { AccordionItemRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		value,
		data = undefined,
		disabled = false,
		factory = undefined,
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
		{ preset: () => preset, id: () => ID, factory: () => factory }
	);
	const bond = root.bond;

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['border-border', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ accordionItem: bond },
	el.motion(),
	el
)}
