<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { clamp } from '$svelte-atoms/core/utils/math';
	import type { ProgressLinearProps } from './types';
	import { HtmlElement } from '../element';

	let {
		class: klass = '',
		value = null,
		max = 100,
		preset = undefined,
		...restProps
	}: ProgressLinearProps & HTMLAttributes<HTMLDivElement> = $props();

	const linearProps = $derived(mergePresetProps(preset, 'progress.linear', restProps));

	const isIndeterminate = $derived(value === null || value === undefined);
	const percent = $derived(isIndeterminate ? null : clamp((value! / max) * 100, 0, 100));
</script>

{#snippet defaultLinearFill({ percent: p }: { percent: number | null })}
	<HtmlElement
		preset="progress.linear.fill"
		as="div"
		class={[
			'progress-fill bg-foreground h-full rounded-full transition-[width] duration-300',
			isIndeterminate && 'animate-progress-indeterminate w-1/3',
			'$preset'
		]}
		style={p !== null ? `width: ${p}%` : undefined}
	/>
{/snippet}

<HtmlAtom
	as="div"
	class={['progress-root flex flex-col gap-1', '$preset', klass]}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={isIndeterminate ? undefined : (value ?? undefined)}
	aria-valuetext={isIndeterminate ? undefined : `${Math.round(percent!)}%`}
	data-indeterminate={isIndeterminate}
	data-value={isIndeterminate ? undefined : (value ?? undefined)}
	data-max={max}
	data-completed={!isIndeterminate && percent === 100}
	{...linearProps}
>
	<HtmlElement
		preset="progress.linear.track"
		as="div"
		class="progress-track bg-input border-none p-0.5 h-2 w-full overflow-hidden rounded-full border $preset"
	>
		{@render defaultLinearFill({ percent })}
	</HtmlElement>
</HtmlAtom>

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
