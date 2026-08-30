<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { clamp } from '$ixirjs/ui/utils/math';
	import type { SliderProps, SliderValueChangeDetails, SliderTrackContentProps } from './types';

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
		thumbContent = undefined,
		trackContent = undefined,
		presets = undefined,
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		children = undefined,
		...restProps
	}: SliderProps = $props();

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

	// The three parts' resolved props are spread by the default snippets and handed to the custom
	// ones, so each resolves through the seam without an element of its own.
	const variantProps = () => ({ orientation, disabled });
	const track = Kernel.element(() => ({ class: isVertical ? 'h-full w-2' : 'h-2 w-full' }), {
		preset: 'slider.track',
		class: 'slider-track bg-input border-border relative overflow-hidden rounded-full',
		layer: () => presets?.track,
		variantProps
	});
	const fill = Kernel.element(
		() => ({ class: isVertical ? 'bottom-0 left-0 w-full' : 'left-0 top-0 h-full' }),
		{
			preset: 'slider.fill',
			class: 'slider-fill bg-foreground absolute rounded-full',
			layer: () => presets?.fill,
			variantProps,
			attrs: () => ({ style: isVertical ? `height: ${percent}%` : `width: ${percent}%` })
		}
	);
	const thumb = Kernel.element(
		() => ({
			class: isVertical
				? 'left-1/2 -translate-x-1/2 translate-y-1/2'
				: 'top-1/2 -translate-x-1/2 -translate-y-1/2'
		}),
		{
			preset: 'slider.thumb',
			class: 'slider-thumb pointer-events-none absolute h-5 w-5',
			layer: () => presets?.thumb,
			variantProps,
			attrs: () => ({ style: isVertical ? `bottom: ${percent}%` : `left: ${percent}%` })
		}
	);

	let hasInitialized = false;

	$effect(() => {
		const nextValue = clampNumber(value, normalizedMin, normalizedMax);
		if (nextValue !== value) {
			value = nextValue;
			if (hasInitialized) onvaluechange?.(nextValue, createDetails(nextValue));
		}
		hasInitialized = true;
	});

	function createDetails(currentValue: number): SliderValueChangeDetails {
		const range = normalizedMax - normalizedMin;
		const currentPercent = range <= 0 ? 0 : ((currentValue - normalizedMin) / range) * 100;

		return {
			percent: currentPercent,
			min: normalizedMin,
			max: normalizedMax,
			step: normalizedStep,
			type: 'number'
		};
	}

	function commitValue(
		nextValue: number,
		event: Event,
		nativeCallback: ((event: Event) => void) | undefined
	) {
		const changed = value !== nextValue;
		value = nextValue;
		nativeCallback?.(event);

		if (changed) {
			onvaluechange?.(nextValue, { event, ...createDetails(nextValue) });
		}
	}

	function handleInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const nextValue = clampNumber(Number(input.value), normalizedMin, normalizedMax);
		commitValue(nextValue, event, oninput);
	}

	function handleChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const nextValue = clampNumber(Number(input.value), normalizedMin, normalizedMax);
		commitValue(nextValue, event, onchange);
	}

	// State classes ride the consumer layer's `class` (Kernel's own-attrs `class` is not merged).
	const el = Kernel.element(
		() => ({
			class: [
				isVertical ? 'h-full w-6 flex-col' : 'h-6 w-full flex-row',
				disabled && 'cursor-not-allowed opacity-50',
				klass
			],
			...restProps
		}),
		{
			preset: 'slider',
			class: 'slider-root relative flex items-center',
			attrs: () => ({ 'aria-orientation': orientation })
		}
	);
</script>

<div {...el.attrs}>
	{@render (trackContent ?? defaultTrack)({
		value: normalizedValue,
		percent,
		min: normalizedMin,
		max: normalizedMax,
		props: track.attrs
	})}

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
		style={isVertical
			? 'writing-mode: vertical-lr; direction: rtl; touch-action: none;'
			: undefined}
		aria-valuemin={normalizedMin}
		aria-valuemax={normalizedMax}
		aria-valuenow={normalizedValue}
		aria-orientation={orientation}
		aria-disabled={disabled || undefined}
	/>

	<div {...thumb.attrs}>
		{@render (thumbContent ?? defaultThumb)({
			value: normalizedValue,
			percent,
			props: thumb.attrs
		})}
	</div>
</div>

{@render children?.()}

{#snippet defaultTrack({ props }: SliderTrackContentProps)}
	<div {...props}>
		<div {...fill.attrs}></div>
	</div>
{/snippet}

{#snippet defaultThumb()}
	<div
		class="bg-foreground border-border h-full w-full rounded-full shadow-sm shadow-black/50"
	></div>
{/snippet}
