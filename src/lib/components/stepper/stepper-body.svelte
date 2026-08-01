<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { Stack } from '../stack';
	import { StepperBond } from './bond.svelte';
	import type { StepperBodyProps } from './types';

	const bond = StepperBond.getOrThrow('Stepper.Body must be used within a Stepper component.');

	let {
		class: klass = '',
		base = Stack.Root as unknown as B,
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperBodyProps<E, B> = $props();

	const bodyProps = $derived(mergePresetProps(preset, 'stepper.body', restProps));
</script>

<HtmlAtom {bond} {base} class={['stepper-body w-full', '$preset', klass]} {...bodyProps}>
	{@render children?.({ stepper: bond })}
</HtmlAtom>
