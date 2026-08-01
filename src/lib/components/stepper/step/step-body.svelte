<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond } from './bond.svelte';
	import { StepperBond } from '../bond.svelte';
	import type { StepContentProps } from './types';
	import { Stack } from '../../stack';

	const stepBond = StepBond.get();
	const stepperBond = StepperBond.get();

	let {
		class: klass = '',
		base = Stack.Item as unknown as B,
		children = undefined,
		preset = undefined,
		...restProps
	}: StepContentProps<E, B> = $props();

	const contentProps = $derived({
		class: klass,
		preset: preset ?? 'stepper.step.content',
		base,
		...restProps
	});

	// Register content snippet with the stepper while mounted.
	$effect(() => {
		if (stepBond && stepperBond && children) {
			const index = stepBond.state.props.index;
			stepperBond.state.registerStepContent(index, contentProps, children);

			return () => {
				stepperBond.state.unregisterStepContent(index);
			};
		}
	});
</script>

<!-- Content is teleported to Stepper.Content; nothing rendered here. -->
