<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { clamp } from '$ixirjs/ui/utils/math';
	import type { ProgressLinearProps } from './types';

	let { value = null, max = 100, ...restProps }: ProgressLinearProps = $props();

	const isIndeterminate = $derived(value === null || value === undefined);
	const percent = $derived(isIndeterminate ? null : clamp((value! / max) * 100, 0, 100));

	const el = Kernel.element(() => restProps, {
		preset: 'progress.linear',
		class: 'progress-root flex flex-col gap-1',
		attrs: () => ({
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': max,
			'aria-valuenow': isIndeterminate ? undefined : (value ?? undefined),
			'aria-valuetext': isIndeterminate ? undefined : `${Math.round(percent!)}%`,
			'data-indeterminate': isIndeterminate,
			'data-value': isIndeterminate ? undefined : (value ?? undefined),
			'data-max': max,
			'data-completed': !isIndeterminate && percent === 100
		})
	});
	// Track and fill take no consumer props; the fill's state classes and width are its own.
	const none = {};
	const trackEl = Kernel.element(() => none, {
		preset: 'progress.linear.track',
		class:
			'progress-track bg-input border-none p-0.5 h-2 w-full overflow-hidden rounded-full border'
	});
	// The state class rides in the consumer's class slot (it must compose after the preset), the
	// width in the part's own attrs (so `class` stays the first attribute, as it renders today).
	const fillEl = Kernel.element(
		() => (isIndeterminate ? { class: 'animate-progress-indeterminate w-1/3' } : none),
		{
			preset: 'progress.linear.fill',
			class: 'progress-fill bg-foreground h-full rounded-full transition-[width] duration-300',
			attrs: () => (percent !== null ? { style: `width: ${percent}%` } : none)
		}
	);
	// Dispatch rather than literal tags: this component owns a style block with keyframes, and Svelte
	// stamps its scope hash onto every spread-bearing element in the template. The leaves render
	// the elements from Kernel's module, so the hash stays off them.
	const leaf = Kernel.render(el);
	const trackLeaf = Kernel.render(trackEl);
	const fillLeaf = Kernel.render(fillEl);
</script>

{@render leaf(el, track)}

{#snippet track()}
	{@render trackLeaf(trackEl, fill)}
{/snippet}

{#snippet fill()}
	{@render fillLeaf(fillEl)}
{/snippet}

<style>
	@keyframes progress-indeterminate {
		0% {
			transform: translateX(-100%);
		}
		50% {
			transform: translateX(300%);
		}
		100% {
			transform: translateX(-100%);
		}
	}

	:global(.animate-progress-indeterminate) {
		animation: progress-indeterminate 1.8s ease-in-out infinite;
	}
</style>
