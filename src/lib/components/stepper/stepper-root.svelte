<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepperBond, StepperState, type StepperStateProps } from './bond.svelte';
	import type { StepperRootProps } from './types';
	import type { Factory } from '$svelte-atoms/core/types';

	let {
		step = $bindable(0),
		linear = false,
		disabled = false,
		orientation = 'horizontal',
		class: klass = '',
		children = undefined,
		factory = defaultFactory as Factory<StepperBond>,
		preset = undefined,
		...restProps
	}: StepperRootProps<E, B> = $props();

	const binding = bindBond<StepperBond>(
		(props) => factory(props),
		{
			step: [() => step, (v) => { step = v; }],
			linear: () => linear,
			disabled: () => disabled,
			orientation: () => orientation,
			rest: () => restProps
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	function defaultFactory(props: StepperStateProps) {
		const bondState = new StepperState(props);
		return new StepperBond(bondState);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['flex flex-col', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ stepper: bond })}
</HtmlAtom>
