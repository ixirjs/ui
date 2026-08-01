<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StepBodyAtom, StepBond } from './bond.svelte';
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

	const bodyAtom = stepBond
		? createAtomInstance<StepBodyAtom, StepBond>('body', {
				bond: stepBond,
				factory: (owner) => new StepBodyAtom(owner as StepBond)
			})
		: undefined;

	const contentProps = $derived({
		class: klass,
		base,
		...mergeAtomProps(bodyAtom, preset ?? 'stepper.step.content', restProps)
	});

	// Register content snippet with the stepper while mounted.
	$effect(() => {
		if (stepBond && stepperBond && children) {
			const index = stepBond.props.index;
			stepperBond.registerStepContent(index, contentProps, children);

			return () => {
				stepperBond.unregisterStepContent(index);
			};
		}
	});
</script>

<!-- Content is teleported to Stepper.Content; nothing rendered here. -->
