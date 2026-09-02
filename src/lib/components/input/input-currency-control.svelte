<script lang="ts">
	import { useControl, INPUT_OVERLAY_FIELD_CLASS } from './shared';
	import { cn } from '$ixirjs/ui/utils';
	import SegmentOverlay from './segment-overlay.svelte';
	import { clamp as clampRange } from '$ixirjs/ui/utils/math';
	import { createParsedValue } from './parsed-value.svelte';
	import type { InputCurrencyControlProps } from './types';

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

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		// The element is `type="text"` (it holds a locale edit string), but `value` is always a
		// plain decimal — so `bond.number` should treat this as a number control.
		type: () => 'number'
	});

	let inputEl = $state<HTMLInputElement>();
	let isFocused = $state(false);
	// The in-progress edit string. The element's `value` attribute renders it, so a rerender while
	// focused restores what was typed instead of clobbering it.
	let draft = $state('');

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

	const parsedValue = createParsedValue({
		raw: { get: () => value, set: (next) => (value = next) },
		parsed: { get: () => amount, set: (next) => (amount = next) },
		parse: (raw) => {
			if (!raw.trim()) return { value: undefined };
			const parsed = parseRaw(raw);
			return parsed === undefined ? undefined : { value: clamp(parsed) };
		},
		format: (parsed) => (parsed === undefined ? '' : clamp(parsed).toFixed(precision)),
		preferRaw: (raw) => raw.trim() !== '',
		onRawChange: (raw) => control.setValue(raw)
	});

	function commitAndNotify(n: number | undefined, event: Event, reason: string) {
		const previousValue = value;
		parsedValue.setParsed(n === undefined ? undefined : clamp(n));
		if (Object.is(previousValue, value)) return;

		control.notify(onvaluechange, value, event, reason, { amount });
	}

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

	// Intl part types map to classes; the overlay renders them as ordinary spans.
	const PART_CLASS: Record<string, string> = {
		currency: 'text-muted-foreground font-normal',
		integer: 'text-foreground font-medium',
		decimal: 'text-muted-foreground',
		fraction: 'text-foreground/70',
		group: 'text-muted-foreground/60',
		literal: 'text-muted-foreground/60'
	};

	const overlaySpans = $derived(
		formattedParts.map((part) => ({ text: part.value, class: PART_CLASS[part.type] }))
	);

	function handleFocus() {
		if (readonly) return;
		isFocused = true;
		draft = amount !== undefined ? toEditString(amount) : '';
		if (inputEl) inputEl.value = draft;
	}

	function handleBlur(event: FocusEvent) {
		if (readonly) return;
		isFocused = false;
		commitAndNotify(parseRaw(inputEl?.value ?? ''), event, 'blur');
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		draft = (event.currentTarget as HTMLInputElement).value;
		// `commitAndNotify` is equality-gated, so this is safe alongside the blur/change commits.
		commitAndNotify(parseRaw(draft), event, 'input');
	}

	function handleChange(event: Event) {
		onchange?.(event);
		if (event.defaultPrevented) return;

		commitAndNotify(parseRaw(inputEl?.value ?? ''), event, 'change');
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (disabled || readonly) return;
		if (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
		ev.preventDefault();
		const dir = ev.key === 'ArrowUp' ? 1 : -1;
		const multiplier = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
		commitAndNotify((amount ?? 0) + dir * stepSize * multiplier, ev, 'step');
		if (amount !== undefined) draft = toEditString(amount);
		if (inputEl && amount !== undefined) inputEl.value = draft;
	}

	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const parsed = parseRaw(ev.clipboardData?.getData('text') ?? '');
		if (parsed === undefined) return;
		draft = toEditString(parsed);
		if (inputEl) inputEl.value = draft;
		commitAndNotify(parsed, ev, 'paste');
	}
</script>

<!--
  The <input> below is this control's own: it holds the locale edit string (`toEditString(amount)`)
  rather than `value`, and three handlers write `inputEl.value` imperatively. Only the overlay is
  shared — see the note in segment-overlay.svelte for why that is the seam and the field is not.
-->
<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
	<!-- Display overlay — shown while blurred -->
	{@render (!isFocused ? formattedOverlay : undefined)?.()}

	<!-- Native input — transparent while blurred, visible while focused -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode="decimal"
		autocomplete="off"
		spellcheck={false}
		value={isFocused ? draft : ''}
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			INPUT_OVERLAY_FIELD_CLASS,
			isFocused
				? 'text-foreground placeholder:text-muted-foreground'
				: 'text-transparent placeholder:text-transparent',
			control.class
		)}
		{...control.attrs}
		oninput={handleInput}
		onchange={handleChange}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		onpaste={handlePaste}
	/>
</span>

{#snippet formattedOverlay()}
	<SegmentOverlay spans={overlaySpans} {placeholder} />
{/snippet}
