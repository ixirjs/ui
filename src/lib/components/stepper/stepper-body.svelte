<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { Stack } from '$ixirjs/ui/components/stack';
	import { StepperContext } from './bond.svelte';
	import type { StepperBodyProps } from './types';

	let {
		as = undefined,
		base = Stack.Root as unknown as StepperBodyProps['base'],
		children = undefined,
		...restProps
	}: StepperBodyProps = $props();
	const bond = StepperContext.getOrThrow('Stepper.Body must be used within a Stepper component.');

	// Renders through `Stack.Root` by default (`base`), so the active content stacks in place.
	const el = Kernel.element(() => restProps, {
		preset: 'stepper.body',
		class: 'stepper-body w-full',
		state: bond,
		as: () => as,
		base: () => base
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { stepper: bond })}
