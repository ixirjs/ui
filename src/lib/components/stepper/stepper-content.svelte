<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepperBond, type StepContentSnippet } from './bond.svelte';
	import type { StepperContentProps } from './types';

	const bond = StepperBond.get();

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperContentProps<E, B> = $props();

	const activeStep = $derived(bond?.state?.getStep(bond?.state?.props?.step));
	const activeStepContent = $derived(bond?.state?.activeStepContent);

	const contentKlass = $derived(activeStepContent?.props.class)
	const contentProps = $derived.by(()=> {
		const { class: klass, ...restContentProps } = activeStepContent?.props ?? {};
		return {
			preset: preset ?? 'stepper.content',
			...restContentProps,
			...restProps
		}
	});

	const content = $derived(activeStepContent && activeStep ? body : undefined);
</script>

{#snippet body(stepContent: StepContentSnippet)}
	{#key stepContent}
		<HtmlAtom
			{bond}
			class={['stepper-content w-full', '$preset', contentKlass, klass]}
			{...contentProps}
		>
			<!-- Render teleported step content -->
			{@render stepContent.children({ step: activeStep! })}

			<!-- Optional custom content wrapper -->
			<!-- {@render children?.({ stepper: bond })} -->
		</HtmlAtom>
	{/key}
{/snippet}

{@render content?.(activeStepContent!)}
