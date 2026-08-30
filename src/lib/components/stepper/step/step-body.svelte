<script lang="ts">
	import { StepperContext } from '$ixirjs/ui/components/stepper/bond.svelte';
	import { StepContext } from './bond.svelte';
	import type { StepContentProps } from './types';

	// `base` is accepted for compatibility and not applied: `Stepper.Content` owns the element the
	// registered content renders into, exactly as it did before.
	let {
		class: klass = '',
		base = undefined,
		children = undefined,
		...restProps
	}: StepContentProps = $props();
	const stepBond = StepContext.getOrThrow('<Step.Body /> must be used within a <Step.Root />');
	const stepperBond = StepperContext.get();

	const contentProps = $derived({ class: klass, base, ...restProps });

	// Register content snippet with the stepper while mounted.
	$effect(() => {
		if (stepperBond && children) {
			return stepperBond.registerStepContent(stepBond.props.index, contentProps, children);
		}
	});
</script>

<!-- Content is teleported to Stepper.Content; nothing rendered here. -->
