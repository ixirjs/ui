<script lang="ts">
	import { inputChangeContext, resolveControlPreset, writeInputValue } from './shared';
	import { cn, toClassValue } from '$ixirjs/ui/utils';
	import { clamp as clampRange } from '$ixirjs/ui/utils/math';
	import { untrack } from 'svelte';
	import { InputBond } from './bond.svelte';
	import type { InputCurrencyControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
		amount = $bindable<number | undefined>(undefined),
		currency = 'USD',
		locale = 'en-US',
		precision = 2,
		min = undefined,
		max = undefined,
		step = undefined,
		placeholder = '0.00',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.currency',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputCurrencyControlProps = $props();

	const preset = resolveControlPreset(
		() => presetKey,
		bond,
		() => restProps,
		() => toClassValue(klass, bond)
	);

	let inputEl = $state<HTMLInputElement>();
	let isFocused = $state(false);

	// Locale separators + pre-compiled regexes
	const separators = $derived.by(() => {
		const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
		const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
		const group = parts.find((p) => p.type === 'group')?.value ?? ',';
		const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return {
			decimal,
			reGroup: new RegExp(esc(group), 'g'),
			reDecimal: new RegExp(esc(decimal))
		};
	});

	const stepSize = $derived(step ?? Math.pow(10, -precision));

	const clamp = (n: number) => clampRange(n, min ?? -Infinity, max ?? Infinity);

	function parseRaw(raw: string): number | undefined {
		const cleaned = raw
			.replace(separators.reGroup, '')
			.replace(separators.reDecimal, '.')
			.replace(/[^0-9.-]/g, '')
			.trim();
		if (!cleaned || cleaned === '-') return undefined;
		const n = parseFloat(cleaned);
		return isNaN(n) ? undefined : n;
	}

	function toEditString(n: number): string {
		return n.toFixed(precision).replace('.', separators.decimal);
	}

	// Sole writer of `amount` + `value`.
	function commit(n: number | undefined) {
		amount = n !== undefined ? clamp(n) : undefined;
		value = amount !== undefined ? amount.toFixed(precision) : '';
		writeInputValue(bond, value);
	}

	function commitAndNotify(n: number | undefined, event: Event, reason: string) {
		const previousValue = value;
		commit(n);
		if (Object.is(previousValue, value)) return;

		onvaluechange?.(value, inputChangeContext(bond, event, reason, { amount }));
	}

	// Seed `amount` from the `value` string when the parent supplies only `value`.
	$effect(() => {
		untrack(() => {
			if (amount === undefined && value) commit(parseRaw(value));
		});
	});

	// Display overlay parts
	const formattedParts = $derived(
		amount !== undefined
			? new Intl.NumberFormat(locale, {
					style: 'currency',
					currency,
					minimumFractionDigits: precision,
					maximumFractionDigits: precision
				}).formatToParts(amount)
			: []
	);

	function handleFocus() {
		if (readonly) return;
		isFocused = true;
		if (inputEl) inputEl.value = amount !== undefined ? toEditString(amount) : '';
	}

	function handleBlur(event: FocusEvent) {
		if (readonly) return;
		isFocused = false;
		commitAndNotify(parseRaw(inputEl?.value ?? ''), event, 'blur');
	}

	function handleInput(event: Event) {
		// Currency commits on blur or an explicit keyboard/paste operation.
		oninput?.(event);
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (disabled || readonly) return;
		if (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
		ev.preventDefault();
		const dir = ev.key === 'ArrowUp' ? 1 : -1;
		const multiplier = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
		commitAndNotify((amount ?? 0) + dir * stepSize * multiplier, ev, 'step');
		if (inputEl && amount !== undefined) inputEl.value = toEditString(amount);
	}

	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const parsed = parseRaw(ev.clipboardData?.getData('text') ?? '');
		if (parsed === undefined) return;
		const str = toEditString(parsed);
		if (inputEl) inputEl.value = str;
		commitAndNotify(parsed, ev, 'paste');
	}
</script>

<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
	<!-- Display overlay — shown while blurred -->
	{#if !isFocused}
		<span
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-2 font-mono text-sm"
			style="white-space: pre;"
		>
			{#if formattedParts.length}
				{#each formattedParts as part (part)}
					<span
						class={cn(
							part.type === 'currency' && 'text-muted-foreground font-normal',
							part.type === 'integer' && 'text-foreground font-medium',
							part.type === 'decimal' && 'text-muted-foreground',
							part.type === 'fraction' && 'text-foreground/70',
							part.type === 'group' && 'text-muted-foreground/60',
							part.type === 'literal' && 'text-muted-foreground/60'
						)}>{part.value}</span
					>
				{/each}
			{:else}
				<span class="text-muted-foreground">{placeholder}</span>
			{/if}
		</span>
	{/if}

	<!-- Native input — transparent while blurred, visible while focused -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode="decimal"
		autocomplete="off"
		spellcheck={false}
		value={isFocused ? (amount !== undefined ? toEditString(amount) : '') : ''}
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			'relative h-full w-full flex-1 bg-transparent px-2 font-mono text-sm caret-foreground outline-none',
			isFocused
				? 'text-foreground placeholder:text-muted-foreground'
				: 'text-transparent placeholder:text-transparent',
			disabled && 'cursor-not-allowed opacity-50',
			preset.class
		)}
		{...preset.attrs}
		oninput={handleInput}
		{onchange}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		onpaste={handlePaste}
	/>
</span>
