<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepContext } from './bond.svelte';
	import { StepperContext } from '$ixirjs/ui/components/stepper/bond.svelte';
	import type { StepSeparatorProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: StepSeparatorProps = $props();
	const bond = StepContext.getOrThrow('<Step.Separator /> must be used within a <Step.Root />');
	const stepper = StepperContext.getOrThrow(
		'StepSeparator must be used within a Stepper component.'
	);

	const el = Kernel.element(() => restProps, {
		preset: 'stepper.step.separator',
		class: 'flex-1 data-[active=true]:bg-primary data-[completed=true]:bg-primary/70',
		state: bond,
		as: () => as,
		base: () => base,
		// The orientation classes ride the instance layer: applied after the preset, before the consumer.
		layer: () => ({
			class: `${stepper.props.orientation === 'vertical' ? 'h-8 w-0.5 mx-auto' : 'h-0.5 w-full my-auto'} bg-border`
		}),
		attrs: () => ({
			id: bond.partId('separator'),
			'aria-hidden': 'true',
			role: 'presentation',
			...bond.statusAttrs
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { step: bond })}
