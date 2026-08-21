<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { StepBond } from './bond.svelte';
	const PART = Kernel.plan(StepBond, 'body', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { StepperBond } from '$ixirjs/ui/components/stepper/bond.svelte';
	import type { StepContentProps } from './types';
	import { Stack } from '$ixirjs/ui/components/stack';

	let {
		class: klass = '',
		base = Stack.Item as unknown as B,
		children = undefined,
		preset = undefined,
		...restProps
	}: StepContentProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset: preset ?? 'stepper.step.content' }), {
		context: 'required',
		rest: () => restProps
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
