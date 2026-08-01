<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond } from './bond.svelte';
	import { StepperBond } from '../bond.svelte';
	import type { StepSeparatorProps } from './types';

	const bond = StepBond.get();

	if(!bond){
		throw new Error('StepSeparator must be used within a Step component.');
	}

	const stepperBond = StepperBond.get();

	if(!stepperBond){
		throw new Error('StepSeparator must be used within a Stepper component.');
	}

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepSeparatorProps<E, B> = $props();


	const atom = bond.atom('separator');

	const separatorProps = $derived({
		preset: preset ?? atom.preset,
		...atom?.spread,
		...restProps
	});

	const isVertical = $derived(stepperBond?.state?.props?.orientation === 'vertical');
</script>

<Atom
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
</Atom>
