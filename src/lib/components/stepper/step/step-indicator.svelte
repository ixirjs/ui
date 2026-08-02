<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	const el = usePartElement(part, () => ({
		class: [
			'flex h-8 w-8 items-center justify-center border-border rounded-full border-2 transition-colors',
			'transition-all',
			part.bond.isActive
				? 'bg-primary border-primary text-primary-foreground font-bold'
				: part.bond.isCompleted
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-border bg-background',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render partElement(el, body)}

{#snippet body()}
	{@render (children ?? (part.bond.isCompleted ? completedMark : ordinal))({ step: part.bond })}
{/snippet}

{#snippet completedMark()}
	<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
	</svg>
{/snippet}

{#snippet ordinal()}
	{index + 1}
{/snippet}
