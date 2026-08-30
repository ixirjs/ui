<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepContext } from './bond.svelte';
	import type { StepHeaderProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: StepHeaderProps = $props();
	const bond = StepContext.getOrThrow('<Step.Header /> must be used within a <Step.Root />');

	// The step's rendered container: group semantics and the label linkage live here.
	const el = Kernel.element(() => restProps, {
		preset: 'stepper.step.header',
		class: 'font-medium text-sm flex flex-col',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const attrs: Record<string, unknown> = {
				id: bond.partId('header'),
				...bond.statusAttrs,
				role: 'group',
				'aria-disabled': bond.isDisabled
			};
			if (bond.titleId) attrs['aria-labelledby'] = bond.titleId;
			if (bond.descriptionId) attrs['aria-describedby'] = bond.descriptionId;
			return attrs;
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { step: bond })}
