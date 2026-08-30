<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepperContext } from './bond.svelte';
	import type { StepperHeaderProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: StepperHeaderProps = $props();
	const bond = StepperContext.getOrThrow('Stepper.Header must be used within a Stepper component.');

	const el = Kernel.element(() => restProps, {
		preset: 'stepper.header',
		class: 'stepper-header w-full',
		state: bond,
		as: () => as,
		base: () => base
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { stepper: bond })}
