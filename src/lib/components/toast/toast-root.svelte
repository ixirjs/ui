<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { ToastBond } from './bond.svelte';
	import type { ToastRootProps } from './types';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';

	const ID = $props.id();

	let {
		open = $bindable(true),
		disabled = false,
		duration = 0,
		dismissible = true,
		preset = undefined,
		factory = undefined,
		children = undefined,
		onopenchange = undefined,
		...restProps
	}: ToastRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, ToastBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		ToastBond,
		{
			open: openProp,
			disabled: () => disabled,
			dismissible: () => dismissible,
			duration: () => duration
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
		class: '',
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { toast: bond })}
