<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { clamp } from '$svelte-atoms/core/utils/math';
	import type { SliderChangeDetails, SliderProps } from './types';

	let {
		class: klass = '',
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		id,
		name,
		orientation = 'horizontal',
		preset = undefined,
		thumbContent = undefined,
		trackContent = undefined,
		onchange = undefined,
		oninput = undefined,
		children = undefined,
		...restProps
	}: SliderProps & HTMLAttributes<HTMLDivElement> = $props();

	const sliderProps = $derived(mergePresetProps(preset, 'slider', restProps));

	function clampNumber(current: number, lower: number, upper: number) {
		if (!Number.isFinite(current)) return lower;
		return clamp(current, lower, upper);
	}

	const normalizedMin = $derived(Math.min(min, max));
	const normalizedMax = $derived(Math.max(min, max));
	const normalizedStep = $derived(step > 0 ? step : 1);

	const normalizedValue = $derived(clampNumber(value, normalizedMin, normalizedMax));
	const isVertical = $derived(orientation === 'vertical');
	const percent = $derived.by(() => {
		const range = normalizedMax - normalizedMin;
		if (range <= 0) return 0;
		return ((normalizedValue - normalizedMin) / range) * 100;
	});

	$effect(() => {
		const nextValue = clampNumber(value, normalizedMin, normalizedMax);
		if (nextValue !== value) {
			value = nextValue;
		}
	});

	function createDetails(currentValue: number): SliderChangeDetails {
		const range = normalizedMax - normalizedMin;
		const currentPercent = range <= 0 ? 0 : ((currentValue - normalizedMin) / range) * 100;

		return {
			value: currentValue,
			percent: currentPercent,
			min: normalizedMin,
			max: normalizedMax,
			step: normalizedStep,
			type: 'number'
		};
	}

	function handleInput(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		const nextValue = clampNumber(Number(input.value), normalizedMin, normalizedMax);
		value = nextValue;
		oninput?.(ev, createDetails(nextValue));
	}

	function handleChange(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		const nextValue = clampNumber(Number(input.value), normalizedMin, normalizedMax);
		value = nextValue;
		onchange?.(ev, createDetails(nextValue));
	}
</script>

{#snippet defaultTrack()}
	<HtmlAtom
		preset="slider.track"
		as="div"
		class={[
			'slider-track bg-input border-border relative overflow-hidden rounded-full',
			isVertical ? 'h-full w-2' : 'h-2 w-full',
			'$preset'
		]}
	>
		<HtmlAtom
			preset="slider.fill"
			as="div"
			class={[
				'slider-fill bg-foreground absolute rounded-full',
				isVertical ? 'bottom-0 left-0 w-full' : 'left-0 top-0 h-full',
				'$preset'
			]}
			style={isVertical ? `height: ${percent}%` : `width: ${percent}%`}
		/>
	</HtmlAtom>
{/snippet}

{#snippet defaultThumb()}
	<div class="bg-foreground border-border h-full w-full rounded-full shadow-sm shadow-black/50"></div>
{/snippet}

{#snippet thumbWrapper()}
	<HtmlAtom
		preset="slider.thumb"
		as="div"
		class={[
			'slider-thumb pointer-events-none absolute h-5 w-5',
			isVertical
				? 'left-1/2 -translate-x-1/2 translate-y-1/2'
				: 'top-1/2 -translate-x-1/2 -translate-y-1/2',
			'$preset'
		]}
		style={isVertical ? `bottom: ${percent}%` : `left: ${percent}%`}
	>
		{@render (thumbContent ?? defaultThumb)({ value: normalizedValue, percent })}
	</HtmlAtom>
{/snippet}

<HtmlAtom
	as="div"
	class={[
		'slider-root relative flex items-center',
		isVertical ? 'h-full w-6 flex-col' : 'h-6 w-full flex-row',
		disabled && 'cursor-not-allowed opacity-50',
		'$preset',
		klass
	]}
	aria-orientation={orientation}
	{...sliderProps}
>
	{@render (trackContent ?? defaultTrack)({ value: normalizedValue, percent, min: normalizedMin, max: normalizedMax })}

	<!-- Native range input — invisible, full coverage, handles all a11y + keyboard -->
	<input
		{id}
		{name}
		min={normalizedMin}
		max={normalizedMax}
		step={normalizedStep}
		{disabled}
		type="range"
		value={normalizedValue}
		oninput={handleInput}
		onchange={handleChange}
		class={[
			'slider-input absolute inset-0 h-full w-full cursor-pointer opacity-0',
			disabled && 'cursor-not-allowed'
		]}
		style={isVertical ? 'writing-mode: vertical-lr; direction: rtl; touch-action: none;' : undefined}
		aria-valuemin={normalizedMin}
		aria-valuemax={normalizedMax}
		aria-valuenow={normalizedValue}
		aria-orientation={orientation}
		aria-disabled={disabled || undefined}
	/>

	{@render thumbWrapper()}
</HtmlAtom>

{@render children?.()}
