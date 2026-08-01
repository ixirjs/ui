<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { InputBond } from './bond.svelte';
	import type { InputNumberControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		number = $bindable(0),
		min = undefined,
		max = undefined,
		step = 1,
		showControls = true,
		disabled = false,
		placeholder = undefined,
		// swallowed: this control renders a raw <input> (no presentation kernel), so `preset` has no effect here
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		preset = undefined,
		decrement = undefined,
		increment = undefined,
		onchange = undefined,
		...restProps
	}: InputNumberControlProps & HTMLAttributes<HTMLDivElement> = $props();

	const numberValue = $derived(number ?? 0);

	const canDecrement = $derived(!disabled && (min === undefined || numberValue - step >= min));
	const canIncrement = $derived(!disabled && (max === undefined || numberValue + step <= max));

	const decrementSnippet = $derived(showControls ? (decrement ?? defaultDecrement) : undefined);
	const incrementSnippet = $derived(showControls ? (increment ?? defaultIncrement) : undefined);

	function handleDecrement() {
		if (!canDecrement) return;
		number = parseFloat((number - step).toPrecision(10));
		onchange?.(undefined, { number });
		if (bond?.state?.props) bond.state.props.value = number;
	}

	function handleIncrement() {
		if (!canIncrement) return;
		number = parseFloat((number + step).toPrecision(10));
		onchange?.(undefined, { number });
		if (bond?.state?.props) bond.state.props.value = number;
	}

	function handleInput(ev: Event) {
		const input = ev.target as HTMLInputElement;
		const parsed = parseFloat(input.value);
		if (!isNaN(parsed)) {
			number = parsed;
			onchange?.(ev, { number });
			if (bond?.state?.props) bond.state.props.value = number;
		}
	}
</script>

<!-- Default part snippets -->

{#snippet defaultDecrement({
	action: dec,
	disabled: dis
}: {
	action: () => void;
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
	action: () => void;
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
	bind:value={number}
	{min}
	{max}
	{step}
	{disabled}
	{placeholder}
	oninput={handleInput}
	class={[
		'input-number-field text-foreground placeholder:text-muted-foreground h-full w-full flex-1 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
		'$preset',
		klass
	]}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={number}
	{...restProps}
/>

{@render incrementSnippet?.({ action: handleIncrement, disabled: !canIncrement })}
