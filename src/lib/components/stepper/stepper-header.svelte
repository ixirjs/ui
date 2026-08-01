<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepperBond } from './bond.svelte';
	import type { StepperHeaderProps } from './types';

	const bond = StepperBond.get();

	if (!bond) {
		throw new Error('Stepper.Header must be used within a Stepper component.');
	}

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperHeaderProps<E, B> = $props();

	const headerProps = $derived({
		preset: preset ?? 'stepper.header',
		...restProps
	});
</script>

<HtmlAtom
	{bond}
	class={['stepper-header w-full', '$preset', klass]}
	{...headerProps}
>
	{@render children?.({ stepper: bond })}
</HtmlAtom>
