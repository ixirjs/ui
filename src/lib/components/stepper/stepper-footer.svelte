<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepperBond } from './bond.svelte';
	import type { StepperFooterProps } from './types';

	const bond = StepperBond.get();

	if(!bond) {
		throw new Error('StepperFooter must be used within a Stepper component.');
	}

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperFooterProps<E, B> = $props();

	const footerProps = $derived({
		preset: preset ?? 'stepper.footer',
		...restProps
	});
</script>

<HtmlAtom
	{bond}
	class={['stepper-footer w-full', '$preset', klass]}
	{...footerProps}
>
	{@render children?.({ stepper: bond })}
</HtmlAtom>
