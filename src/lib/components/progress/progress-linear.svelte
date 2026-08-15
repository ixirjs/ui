<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { clamp } from '$ixirjs/ui/utils/math';
	import type { ProgressLinearProps } from './types';

	let {
		class: klass = '',
		value = null,
		max = 100,
		preset = undefined,
		...restProps
	}: ProgressLinearProps = $props();

	const linearProps = $derived(mergePresetProps(preset, 'progress.linear', restProps));

	const isIndeterminate = $derived(value === null || value === undefined);
	const percent = $derived(isIndeterminate ? null : clamp((value! / max) * 100, 0, 100));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'div',
		class: ['progress-root flex flex-col gap-1', '$preset', klass],
		role: 'progressbar',
		'aria-valuemin': 0,
		'aria-valuemax': max,
		'aria-valuenow': isIndeterminate ? undefined : (value ?? undefined),
		'aria-valuetext': isIndeterminate ? undefined : `${Math.round(percent!)}%`,
		'data-indeterminate': isIndeterminate,
		'data-value': isIndeterminate ? undefined : (value ?? undefined),
		'data-max': max,
		'data-completed': !isIndeterminate && percent === 100,
		...linearProps
	}));
	const trackEl = Kernel.element(Kernel.static, () => ({
		preset: 'progress.linear.track',
		as: 'div',
		class:
			'progress-track bg-input border-none p-0.5 h-2 w-full overflow-hidden rounded-full border'
	}));
	const fillEl = Kernel.element(Kernel.static, () => ({
		preset: 'progress.linear.fill',
		as: 'div',
		class: [
			'progress-fill bg-foreground h-full rounded-full transition-[width] duration-300',
			isIndeterminate && 'animate-progress-indeterminate w-1/3'
		],
		style: percent !== null ? `width: ${percent}%` : undefined
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), track, undefined, el.motion(), el)}

{#snippet track()}
	{@render Kernel.render(trackEl)(
		trackEl.tag(),
		trackEl.class(),
		trackEl.attrs(),
		fill,
		undefined,
		trackEl.motion(),
		trackEl
	)}
{/snippet}

{#snippet fill()}
	{@render Kernel.render(fillEl)(
		fillEl.tag(),
		fillEl.class(),
		fillEl.attrs(),
		undefined,
		undefined,
		fillEl.motion(),
		fillEl
	)}
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
