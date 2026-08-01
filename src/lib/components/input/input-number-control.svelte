<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { InputBond } from './bond.svelte';
	import { cn } from '$ixirjs/ui/utils';
	import { inputChangeContext, resolveControlPreset, writeInputNumber } from './shared';
	import type { InputNumberControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		number = $bindable<number | undefined>(),
		min = undefined,
		max = undefined,
		step = 1,
		showControls = true,
		disabled = false,
		placeholder = undefined,
		preset: presetKey = 'input.number',
		decrement = undefined,
		increment = undefined,
		onchange = undefined,
		oninput = undefined,
		onnumberchange = undefined,
		...restProps
	}: InputNumberControlProps & HTMLAttributes<HTMLDivElement> = $props();

	const presentation = resolveControlPreset(
		() => presetKey,
		bond,
		() => restProps,
		() => klass,
		() => ({ disabled, min, max, step })
	);
	const numberValue = $derived(number ?? 0);

	const canDecrement = $derived(!disabled && (min === undefined || numberValue - step >= min));
	const canIncrement = $derived(!disabled && (max === undefined || numberValue + step <= max));

	const decrementSnippet = $derived(showControls ? (decrement ?? defaultDecrement) : undefined);
	const incrementSnippet = $derived(showControls ? (increment ?? defaultIncrement) : undefined);

	function handleDecrement(event?: MouseEvent) {
		if (!canDecrement) return;
		number = parseFloat((numberValue - step).toPrecision(10));
		writeInputNumber(bond, number);
		onnumberchange?.(number, inputChangeContext(bond, event, 'decrement'));
	}

	function handleIncrement(event?: MouseEvent) {
		if (!canIncrement) return;
		number = parseFloat((numberValue + step).toPrecision(10));
		writeInputNumber(bond, number);
		onnumberchange?.(number, inputChangeContext(bond, event, 'increment'));
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		const input = event.currentTarget as HTMLInputElement;
		number =
			input.value.trim() === '' || Number.isNaN(input.valueAsNumber)
				? undefined
				: input.valueAsNumber;
		writeInputNumber(bond, number);
		onnumberchange?.(
			number,
			inputChangeContext(bond, event, number === undefined ? 'clear' : 'input')
		);
	}

	function handleChange(event: Event) {
		onchange?.(event);
	}
</script>

<!-- Default part snippets -->

{#snippet defaultDecrement({
	action: dec,
	disabled: dis
}: {
	action: (event?: MouseEvent) => void;
	disabled: boolean;
})}
	<button
		type="button"
		onclick={dec}
		disabled={dis}
		aria-label="Decrement"
		class="input-number-decrement text-foreground hover:bg-muted disabled:text-muted-foreground flex h-full aspect-square shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed"
	>
		<svg viewBox="0 0 16 16" fill="none" class="h-3 w-3" aria-hidden="true">
			<path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	</button>
{/snippet}

{#snippet defaultIncrement({
	action: inc,
	disabled: dis
}: {
	action: (event?: MouseEvent) => void;
	disabled: boolean;
})}
	<button
		type="button"
		onclick={inc}
		disabled={dis}
		aria-label="Increment"
		class="input-number-increment text-foreground hover:bg-muted disabled:text-muted-foreground flex h-full aspect-square shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed"
	>
		<svg viewBox="0 0 16 16" fill="none" class="h-3 w-3" aria-hidden="true">
			<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	</button>
{/snippet}

<!-- Render -->

{@render decrementSnippet?.({ action: handleDecrement, disabled: !canDecrement })}

<input
	type="number"
	value={number ?? ''}
	{min}
	{max}
	{step}
	{disabled}
	{placeholder}
	class={cn(
		'input-number-field text-foreground placeholder:text-muted-foreground h-full w-full flex-1 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
		presentation.class
	)}
	{...presentation.attrs}
	oninput={handleInput}
	onchange={handleChange}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={number}
/>

{@render incrementSnippet?.({ action: handleIncrement, disabled: !canIncrement })}
