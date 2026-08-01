<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { StepBond } from './bond.svelte';
	import { StepperBond } from '$ixirjs/ui/components/stepper/bond.svelte';
	import type { StepContentProps } from './types';
	import { Stack } from '$ixirjs/ui/components/stack';

	let {
		class: klass = '',
		base = Stack.Item as unknown as B,
		children = undefined,
		preset = undefined,
		...restProps
	}: StepContentProps<E, B> = $props();

	const part = usePart(StepBond, 'body', () => restProps, {
		preset: () => preset ?? 'stepper.step.content'
	});
	const stepBond = part.bond;
	const stepperBond = StepperBond.get();

	const contentProps = $derived({
		class: klass,
		base,
		...part.props
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
