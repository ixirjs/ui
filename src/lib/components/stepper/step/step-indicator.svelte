<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StepBond, StepIndicatorAtom } from './bond.svelte';
	import type { StepIndicatorProps } from './types';

	const bond = StepBond.getOrThrow('StepIndicator must be used within a Step component');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepIndicatorProps<E, B> = $props();

	const atom = createAtomInstance<StepIndicatorAtom, StepBond>('indicator', {
		bond,
		factory: (owner) => new StepIndicatorAtom(owner as StepBond)
	});

	const indicatorProps = $derived(mergeAtomProps(atom, preset, restProps));

	const index = $derived(bond?.props?.index ?? 0);
</script>

<HtmlAtom
	{bond}
	class={[
		'flex h-8 w-8 items-center justify-center border-border rounded-full border-2 transition-colors',
		'transition-all',
		bond?.isActive
			? 'bg-primary border-primary text-primary-foreground font-bold'
			: bond?.isCompleted
				? 'bg-primary border-primary text-primary-foreground'
				: 'border-border bg-background',
		'$preset',
		klass
	]}
	{...indicatorProps}
>
	{#if children}
		{@render children?.({ step: bond })}
	{:else if bond?.isCompleted}
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	{:else}
		{index + 1}
	{/if}
</HtmlAtom>
