<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepperContext } from './bond.svelte';
	import type { StepperFooterProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: StepperFooterProps = $props();
	const bond = StepperContext.getOrThrow('Stepper.Footer must be used within a Stepper component.');

	const el = Kernel.element(() => restProps, {
		preset: 'stepper.footer',
		class: 'stepper-footer w-full',
		state: bond,
		as: () => as,
		base: () => base
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { stepper: bond })}
