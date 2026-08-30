<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepperContext, type StepContentSnippet } from './bond.svelte';
	import type { StepperContentProps } from './types';

	const bond = StepperContext.get();

	let {
		class: klass = '',
		as = undefined,
		base = undefined,
		// swallowed: this component renders the active step's content, not its own children
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		children = undefined,
		...restProps
	}: StepperContentProps = $props();

	const activeStep = $derived(bond?.getStep(bond?.props.step));
	const activeStepContent = $derived(bond?.activeStepContent);
	const content = $derived(activeStepContent && activeStep ? body : undefined);

	// The active body's registered props (its `Step.Body` attributes and class) land on this
	// element, under this part's own props.
	const el = Kernel.element(
		() => {
			const { class: contentKlass, base: _base, ...contentRest } = activeStepContent?.props ?? {};
			return { ...contentRest, ...restProps, class: [contentKlass, klass] };
		},
		{
			preset: 'stepper.content',
			class: 'stepper-content w-full',
			state: bond,
			as: () => as,
			base: () => base
		}
	);
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render content?.(activeStepContent!)}

{#snippet body(stepContent: StepContentSnippet)}
	{@render leaf(el, stepBody, stepContent)}
{/snippet}

{#snippet stepBody(stepContent: StepContentSnippet)}
	<!-- Keep the host stable; key only the content subtree so atom-based bases can tear down cleanly. -->
	{#key stepContent}
		{@render stepContent.children({ step: activeStep! })}
	{/key}
{/snippet}
