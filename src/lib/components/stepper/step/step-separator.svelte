<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StepBond, StepSeparatorAtom } from './bond.svelte';
	import { StepperBond } from '../bond.svelte';
	import type { StepSeparatorProps } from './types';

	const bond = StepBond.getOrThrow('StepSeparator must be used within a Step component.');

	const stepperBond = StepperBond.getOrThrow(
		'StepSeparator must be used within a Stepper component.'
	);

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepSeparatorProps<E, B> = $props();

	const atom = createAtomInstance<StepSeparatorAtom, StepBond>('separator', {
		bond,
		factory: (owner) => new StepSeparatorAtom(owner as StepBond)
	});

	const separatorProps = $derived(mergeAtomProps(atom, preset, restProps));

	const isVertical = $derived(stepperBond?.props?.orientation === 'vertical');
</script>

<HtmlAtom
	{bond}
	class={[
		'flex-1 data-[active=true]:bg-primary data-[completed=true]:bg-primary/70',
		isVertical ? 'h-8 w-0.5 mx-auto' : 'h-0.5 w-full my-auto',
		'bg-border',
		'$preset',
		klass
	]}
	{...separatorProps}
>
	{@render children?.({ step: bond })}
</HtmlAtom>
