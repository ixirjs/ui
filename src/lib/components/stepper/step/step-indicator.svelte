<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { StepBond } from './bond.svelte';
	import type { StepIndicatorProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepIndicatorProps<E, B> = $props();

	const part = usePart(StepBond, 'indicator', () => restProps, {
		preset: () => preset
	});

	const index = $derived(part.bond.props.index);
</script>

<HtmlAtom
	class={[
		'flex h-8 w-8 items-center justify-center border-border rounded-full border-2 transition-colors',
		'transition-all',
		part.bond.isActive
			? 'bg-primary border-primary text-primary-foreground font-bold'
			: part.bond.isCompleted
				? 'bg-primary border-primary text-primary-foreground'
				: 'border-border bg-background',
		'$preset',
		klass
	]}
	{...restProps}
	{part}
>
	{#if children}
		{@render children?.({ step: part.bond })}
	{:else if part.bond.isCompleted}
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	{:else}
		{index + 1}
	{/if}
</HtmlAtom>
