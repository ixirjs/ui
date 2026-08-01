<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['border-border', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ accordionItem: bond })}
{/snippet}

{@render partElement(el, body)}
