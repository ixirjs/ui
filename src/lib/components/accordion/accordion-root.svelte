<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
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

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['bg-card border-border flex list-none flex-col', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ accordion: bond },
	el.motion(),
	el
)}
