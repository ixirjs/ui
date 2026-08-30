<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepContext } from './bond.svelte';
	import type { StepIndicatorProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: StepIndicatorProps = $props();
	const bond = StepContext.getOrThrow('<Step.Indicator /> must be used within a <Step.Root />');
	const index = $derived(bond.props.index);

	const el = Kernel.element(() => restProps, {
		preset: 'stepper.step.indicator',
		class:
			'flex h-8 w-8 items-center justify-center border-border rounded-full border-2 transition-colors transition-all',
		state: bond,
		as: () => as,
		base: () => base,
		// The status classes ride the instance layer: applied after the preset, before the consumer.
		layer: () => ({
			class: bond.isActive
				? 'bg-primary border-primary text-primary-foreground font-bold'
				: bond.isCompleted
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-border bg-background'
		}),
		attrs: () => ({
			id: bond.partId('indicator'),
			'aria-current': bond.isActive ? 'step' : undefined,
			...bond.statusAttrs,
			role: 'presentation'
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, body)}

{#snippet body()}
	{@render (children ?? (bond.isCompleted ? completedMark : ordinal))({ step: bond })}
{/snippet}

{#snippet completedMark()}
	<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
	</svg>
{/snippet}

{#snippet ordinal()}
	{index + 1}
{/snippet}
