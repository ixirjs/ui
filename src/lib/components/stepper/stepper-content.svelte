<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { StepperBond, type StepContentSnippet } from './bond.svelte';
	import type { StepperContentProps } from './types';

	const bond = StepperBond.get();

	let {
		class: klass = '',
		// swallowed: this component renders the active step's content, not its own children
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperContentProps<E, B> & BasePropsOf<B> = $props();

	const activeStep = $derived(bond?.getStep(bond?.props?.step));
	const activeStepContent = $derived(bond?.activeStepContent);

	const contentKlass = $derived(activeStepContent?.props.class);
	const contentProps = $derived.by(() => {
		const { class: klass, ...restContentProps } = activeStepContent?.props ?? {};
		return mergePresetProps(preset, 'stepper.content', { ...restContentProps, ...restProps });
	});

	const content = $derived(activeStepContent && activeStep ? body : undefined);

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(
		{ atom: undefined, bond, preset: undefined, presetLayer: undefined },
		() => ({
			class: ['stepper-content w-full', '$preset', contentKlass, klass],
			...contentProps
		})
	);
</script>

{@render content?.(activeStepContent!)}

{#snippet body(stepContent: StepContentSnippet)}
	{@render Kernel.render(el)(
		el.tag(),
		el.class(),
		el.attrs(),
		stepBody,
		stepContent,
		el.motion(),
		el
	)}
{/snippet}

{#snippet stepBody(stepContent: StepContentSnippet)}
	<!-- Keep the host stable; key only the content subtree so atom-based bases can tear down cleanly. -->
	{#key stepContent}
		{@render stepContent.children({ step: activeStep! })}
	{/key}
{/snippet}
