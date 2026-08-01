<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { AccordionBond } from './bond.svelte';
	import type { AccordionRootProps } from './types';

	const ID = $props.id();

	let {
		value = $bindable(undefined),
		values = $bindable([]),
		data = $bindable([]),
		class: klass = '',
		multiple = false,
		collapsible = false,
		disabled = false,
		onvaluechange = undefined,
		onvalueschange = undefined,
		children = undefined,
		factory = undefined,
		preset = undefined,
		presets = undefined,
		...restProps
	}: AccordionRootProps<E, B> = $props();

	const valuesProp = controlledProp<string[], AccordionBond>({
		get: () => (multiple ? values : ([value].filter(Boolean) as string[])),
		set: (next) => {
			values = next;
			value = next[0];
		},
		equals: sameValues,
		onchange: (next, context) => {
			if (multiple) onvalueschange?.(next, context);
			else onvaluechange?.(next[0], context);
		}
	});

	const root = useRoot(
		AccordionBond,
		{
			open: () => valuesProp.value.length > 0,
			values: valuesProp,
			multiple: () => multiple,
			collapsible: () => collapsible,
			disabled: () => disabled,
			presets: () => presets
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory
		}
	);
	const bond = root.bond;

	function sameValues(left: readonly string[], right: readonly string[]) {
		return left.length === right.length && left.every((item, index) => item === right[index]);
	}

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['bg-card border-border flex list-none flex-col', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ accordion: bond })}
{/snippet}

{@render partElement(el, body)}
