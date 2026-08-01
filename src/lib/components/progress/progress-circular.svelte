<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { clamp } from '$svelte-atoms/core/utils/math';
	import type { ProgressCircularProps } from './types';
	import { SvgElement } from '../element'

	let {
		class: klass = '',
		value = null,
		max = 100,
		preset = undefined,
		...restProps
	}: ProgressCircularProps & HTMLAttributes<HTMLDivElement> = $props();

	const circularProps = $derived(mergePresetProps(preset, 'progress.circular', restProps));

	const isIndeterminate = $derived(value === null || value === undefined);
	const percent = $derived(isIndeterminate ? null : clamp((value! / max) * 100, 0, 100));

	const radius = 20;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = $derived(
		isIndeterminate ? circumference : circumference - (percent! / 100) * circumference
	);
</script>

{#snippet defaultCircularFill()}
	<SvgElement
		as="circle"
		preset="progress.circular.fill"
		cx="24"
		cy="24"
		r={radius}
		fill="none"
		stroke-width="4"
		stroke-linecap="round"
		stroke-dasharray={circumference}
		stroke-dashoffset={strokeDashoffset}
		class={[
			'stroke-foreground origin-center duration-300',
			!isIndeterminate && 'transition-[stroke-dashoffset]',
			isIndeterminate && 'animate-progress-circular-indeterminate'
		]
			.filter(Boolean)
			.join(' ')}
	/>
{/snippet}

<HtmlAtom
	as="div"
	class={[
		'progress-root progress-root--circular relative inline-flex items-center justify-center',
		'$preset',
		klass
	]}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={isIndeterminate ? undefined : value ?? undefined}
	aria-valuetext={isIndeterminate ? undefined : `${Math.round(percent!)}%`}
	data-indeterminate={isIndeterminate}
	data-value={isIndeterminate ? undefined : value ?? undefined}
	data-max={max}
	data-completed={!isIndeterminate && percent === 100}
	{...circularProps}
>
	<svg viewBox="0 0 48 48" class="h-full w-full -rotate-90" aria-hidden="true">
		<SvgElement
			as="circle"
			preset="progress.circular.track"
			cx="24"
			cy="24"
			r={radius}
			fill="none"
			stroke-width="4"
			class="stroke-input"
		/>
		{@render defaultCircularFill()}
	</svg>
</HtmlAtom>

<style>
	@keyframes progress-circular-spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes progress-circular-dash {
		0% { stroke-dashoffset: 119; }
		50% { stroke-dashoffset: 30; }
		100% { stroke-dashoffset: 119; }
	}

	:global(.animate-progress-circular-indeterminate) {
		animation:
			progress-circular-spin 1.4s linear infinite,
			progress-circular-dash 1.4s ease-in-out infinite;
		transform-origin: center;
	}
</style>
