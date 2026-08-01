<script lang="ts">
	import { Slider } from '$ixirjs/ui/components/slider';
	import type { SliderValueChangeCallback } from '$ixirjs/ui/components/slider/types';

	interface Props {
		onvaluechange?: SliderValueChangeCallback;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
	}

	let { onvaluechange, oninput, onchange }: Props = $props();

	let value = $state(110);
	let max = $state(100);
	let committed = $state<boolean[]>([]);

	function handleValueChange(
		nextValue: Parameters<SliderValueChangeCallback>[0],
		context: Parameters<SliderValueChangeCallback>[1]
	) {
		committed.push(value === nextValue);
		onvaluechange?.(nextValue, context);
	}
</script>

<Slider
	bind:value
	min={0}
	{max}
	step={5}
	onvaluechange={handleValueChange}
	{...oninput ? { oninput } : {}}
	{...onchange ? { onchange } : {}}
/>
<button data-testid="slider-clamp" onclick={() => (max = 20)}>Clamp to 20</button>
<output data-testid="slider-value">{value}</output>
<output data-testid="slider-committed">{committed.join(',')}</output>
