<script lang="ts">
	import { useControl, toFiniteNumber } from './shared';
	import type { InputChangeReason, InputNumberControlProps } from './types';

	let {
		class: klass = '',
		number = $bindable<number | undefined>(),
		min = undefined,
		max = undefined,
		step = 1,
		showControls = true,
		disabled = false,
		readonly = false,
		placeholder = undefined,
		preset: presetKey = 'input.number',
		decrement = undefined,
		increment = undefined,
		onchange = undefined,
		oninput = undefined,
		onnumberchange = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputNumberControlProps = $props();

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass ?? '',
		variantProps: () => ({ disabled, readonly, min, max, step }),
		type: () => 'number',
		base: 'input-number-field text-foreground placeholder:text-muted-foreground h-full w-full flex-1 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
	});
	// With no value yet, a step starts from the lower bound rather than an arbitrary 0.
	const numberValue = $derived(number ?? min ?? 0);

	const canDecrement = $derived(
		!disabled && !readonly && (min === undefined || numberValue - step >= min)
	);
	const canIncrement = $derived(
		!disabled && !readonly && (max === undefined || numberValue + step <= max)
	);

	const decrementSnippet = $derived(showControls ? (decrement ?? defaultDecrement) : undefined);
	const incrementSnippet = $derived(showControls ? (increment ?? defaultIncrement) : undefined);

	// `onnumberchange` is the deprecated alias; both fire with the same value and context.
	function notify(event: Event | undefined, reason: InputChangeReason) {
		control.notify(onvaluechange, number, event, reason);
		control.notify(onnumberchange, number, event, reason);
	}

	function handleDecrement(event?: MouseEvent) {
		if (!canDecrement) return;
		number = parseFloat((numberValue - step).toPrecision(10));
		control.setValue(number);
		notify(event, 'decrement');
	}

	function handleIncrement(event?: MouseEvent) {
		if (!canIncrement) return;
		number = parseFloat((numberValue + step).toPrecision(10));
		control.setValue(number);
		notify(event, 'increment');
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		number = toFiniteNumber(event.currentTarget as HTMLInputElement);
		control.setValue(number);
		notify(event, number === undefined ? 'clear' : 'input');
	}
</script>

<!-- Render -->

{@render decrementSnippet?.({ action: handleDecrement, disabled: !canDecrement })}

<input
	type="number"
	value={number ?? ''}
	{min}
	{max}
	{step}
	{disabled}
	{readonly}
	{placeholder}
	class={control.class}
	{...control.attrs}
	oninput={handleInput}
	{onchange}
/>
<!-- No `aria-value*` here: `min`/`max`/`value` on a native number input already carry them, and
     the attributes are not valid on its implicit role. -->

{@render incrementSnippet?.({ action: handleIncrement, disabled: !canIncrement })}

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
