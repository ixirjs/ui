<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { StepperBond } from './bond.svelte';
	import type { StepperRootProps } from './types';

	const ID = $props.id();

	let {
		step = $bindable(0),
		linear = false,
		disabled = false,
		orientation = 'horizontal',
		onstepchange = undefined,
		class: klass = '',
		children = undefined,
		factory = undefined,
		preset = undefined,
		...restProps
	}: StepperRootProps<E, B> = $props();

	const stepProp = controlledProp<number, StepperBond>({
		get: () => step,
		set: (value) => (step = value),
		onchange: (value, context) => onstepchange?.(value, context)
	});

	const root = useRoot(
		StepperBond,
		{
			step: stepProp,
			linear: () => linear,
			disabled: () => disabled,
			orientation: () => orientation
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
		class: ['flex flex-col', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { stepper: bond })}
