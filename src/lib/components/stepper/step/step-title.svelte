<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepContext } from './bond.svelte';
	import type { StepTitleProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: StepTitleProps = $props();
	const bond = StepContext.getOrThrow('<Step.Title /> must be used within a <Step.Root />');
	// The part hands the header its id at init; a consumer id wins on the element and is followed.
	const id = untrack(() => restProps.id as string | undefined) ?? bond.partId('title');
	bond.titleId = id;

	const el = Kernel.element(() => restProps, {
		preset: 'stepper.step.title',
		class: 'border-border font-medium text-sm',
		state: bond,
		as: () => as ?? 'div',
		base: () => base,
		attrs: () => ({ id })
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { step: bond })}
