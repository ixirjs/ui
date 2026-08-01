<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { StepperBond, type StepperBondProps } from './bond.svelte';
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
		factory = defaultFactory,
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
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	function defaultFactory(props: StepperBondProps) {
		return StepperBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['flex flex-col', '$preset', klass]} {...root.props} {...restProps} part={root}>
	{@render children?.({ stepper: bond })}
</HtmlAtom>
