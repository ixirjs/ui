<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { TreeBond } from './bond.svelte';
	import type { TreeRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		class: klass = '',
		preset = undefined,
		presets = undefined,
		children = undefined,
		factory = undefined,
		onopenchange = undefined,
		...restProps
	}: TreeRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, TreeBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		TreeBond,
		{
			open: openProp,
			disabled: () => disabled,
			presets: () => presets
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory
		}
	);
	const bond: TreeBond = root.bond;

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['flex flex-col', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { tree: bond })}
