<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['flex flex-col', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render partElement(el, children, { stepper: bond })}
