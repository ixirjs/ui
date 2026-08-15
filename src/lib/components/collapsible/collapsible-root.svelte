<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { CollapsibleBond } from './bond.svelte';
	import type { CollapsibleRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		value,
		data = undefined,
		disabled = false,
		factory = undefined,
		onopenchange = undefined,
		children = undefined,
		...restProps
	}: CollapsibleRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, CollapsibleBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context)
	});

	const root = useRoot(
		CollapsibleBond,
		{
			open: openProp,
			data: () => data,
			disabled: () => disabled,
			value: () => value
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory
		}
	);
	const bond = root.bond;

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['border-border flex w-full flex-col overflow-hidden', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ collapsible: bond },
	el.motion(),
	el
)}
