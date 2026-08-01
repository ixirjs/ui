<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond, bondFactory } from '$svelte-atoms/core/shared';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepperBond, StepperState } from './bond.svelte';
	import type { StepperRootProps } from './types';

	let {
		step = $bindable(0),
		linear = false,
		disabled = false,
		orientation = 'horizontal',
		class: klass = '',
		children = undefined,
		factory = bondFactory(StepperState, StepperBond),
		preset = undefined,
		...restProps
	}: StepperRootProps<E, B> = $props();

	const binding = bindBond<StepperBond>(
		(props) => factory(props),
		{
			step: [() => step, (v) => { step = v; }],
			linear: () => linear,
			disabled: () => disabled,
			orientation: () => orientation
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

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
