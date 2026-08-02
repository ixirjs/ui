<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
	}: StepperContentProps<E, B> = $props();

	const activeStep = $derived(bond?.getStep(bond?.props?.step));
	const activeStepContent = $derived(bond?.activeStepContent);

	const contentKlass = $derived(activeStepContent?.props.class);
	const contentProps = $derived.by(() => {
		const { class: klass, ...restContentProps } = activeStepContent?.props ?? {};
		return mergePresetProps(preset, 'stepper.content', { ...restContentProps, ...restProps });
	});

	const content = $derived(activeStepContent && activeStep ? body : undefined);
</script>

{@render content?.(activeStepContent!)}

{#snippet body(stepContent: StepContentSnippet)}
	<HtmlAtom
		{bond}
		class={['stepper-content w-full', '$preset', contentKlass, klass]}
		{...contentProps}
	>
		<!-- Keep the host stable; key only the content subtree so atom-based bases can tear down cleanly. -->
		{#key stepContent}
			{@render stepContent.children({ step: activeStep! })}
		{/key}
	</HtmlAtom>
{/snippet}
