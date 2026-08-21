<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { StepBond } from './bond.svelte';
	const PART = Kernel.plan(StepBond, 'indicator', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { StepIndicatorProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepIndicatorProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });

	const index = $derived(part.bond.props.index);

	const el = Kernel.element(part, () => ({
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

{@render Kernel.render(el)(el, body)}

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
