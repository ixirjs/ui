<script lang="ts">
	import { useControl, INPUT_OVERLAY_FIELD_CLASS } from './shared';
	import { cn } from '$ixirjs/ui/utils';
	import SegmentOverlay from './segment-overlay.svelte';
	import {
		buildPhoneMasked,
		deletePhoneDigitsFromCursor,
		nextPhoneCursorPos,
		parsePhoneFormat,
		phoneDigitSlotKinds,
		phoneMaskMaxDigits,
		phoneOverlaySpans
	} from './phone-mask';
	import type { InputChangeReason, InputPhoneControlProps, PhoneSpan as Span } from './types';

	let {
		class: klass = '',
		value = $bindable(''),
		format = undefined,
		segments: segmentMap = undefined,
		placeholder = '+_ (___) ___-____',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.phone',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		span: spanSnippet = undefined,
		...restProps
	}: InputPhoneControlProps = $props();

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		type: () => 'tel'
	});

	let inputEl = $state<HTMLInputElement>();
	let scrollLeft = $state(0);
	let isFocused = $state(false);

	const tokens = $derived(format ? parsePhoneFormat(format) : []);
	const maxDigits = $derived(phoneMaskMaxDigits(tokens));

	function buildMasked(digits: string, empty = '_'): string {
		return buildPhoneMasked(tokens, digits, empty);
	}

	const digitSlotKind = $derived.by<string[]>(() => {
		return phoneDigitSlotKinds(tokens, segmentMap);
	});

	const overlaySpans = $derived.by<Span[]>(() => {
		if (!format) return [];
		return phoneOverlaySpans({ tokens, value, digitSlotKind, segments: segmentMap });
	});

	// Sync external value → display + caret
	$effect(() => {
		if (!format || !inputEl) return;
		const masked = value || isFocused ? buildMasked(value) : '';
		if (inputEl.value !== masked) inputEl.value = masked;
		// re-place caret via rAF to beat the browser's own placement
		if (isFocused) {
			const pos = nextPhoneCursorPos(tokens, value);
			const raf = requestAnimationFrame(() => inputEl?.setSelectionRange(pos, pos));
			return () => cancelAnimationFrame(raf);
		}
	});

	function commitValue(next: string, event: Event, reason: InputChangeReason) {
		value = next;
		control.setValue(value);
		control.notify(onvaluechange, value, event, reason);
	}

	// Input handler
	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		const input = event.currentTarget as HTMLInputElement;

		if (!format) {
			commitValue(input.value, event, 'input');
			return;
		}

		const digits = input.value.replace(/\D/g, '').slice(0, maxDigits);
		input.value = buildMasked(digits);
		scrollLeft = input.scrollLeft;
		commitValue(digits, event, 'input');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!format) return;
		if (event.key === 'Backspace') {
			event.preventDefault();
			if (!value) return;
			const next = value.slice(0, -1);
			if (inputEl) inputEl.value = next ? buildMasked(next) : buildMasked('');
			commitValue(next, event, 'backspace');
		} else if (event.key === 'Delete') {
			event.preventDefault();
			// clear forward from the digit slot at/after the cursor
			if (!value || !inputEl) return;
			const pos = inputEl.selectionStart ?? 0;
			const next = deletePhoneDigitsFromCursor(tokens, value, pos);
			if (next === value) return;
			inputEl.value = next ? buildMasked(next) : buildMasked('');
			commitValue(next, event, 'delete');
		} else if (
			event.key.length === 1 &&
			!event.ctrlKey &&
			!event.metaKey &&
			!/\d/.test(event.key)
		) {
			// block non-digit printable keys: no input event, caret stays put
			event.preventDefault();
		}
	}

	// Paste handler
	function handlePaste(ev: ClipboardEvent) {
		if (!format) return; // free mode: let native paste fire the `input` event handleInput handles
		ev.preventDefault();
		const pasted = ev.clipboardData?.getData('text') ?? '';

		// mask mode: keep digits only, clamp to maxDigits
		const digits = pasted.replace(/\D/g, '').slice(0, maxDigits);
		if (!digits) return;
		if (inputEl) inputEl.value = buildMasked(digits);
		commitValue(digits, ev, 'paste');
	}

	function handleFocus() {
		if (!format || !inputEl) return;
		isFocused = true;
		if (!value) inputEl.value = buildMasked('');
		// $effect places the caret via rAF
	}

	function handleBlur() {
		if (!format || !inputEl) return;
		isFocused = false;
		if (!value) inputEl.value = '';
	}

	function syncScroll() {
		scrollLeft = inputEl?.scrollLeft ?? 0;
	}
</script>

<!--
  The <input> below is this control's own: it holds the *masked* text while `value` holds bare
  digits, and six handlers write `inputEl.value` imperatively. Only the overlay is shared — see the
  note in segment-overlay.svelte for why that is the seam and the field is not.
-->
{@render (format ? formattedInput : freeInput)()}

{#snippet formattedInput()}
	<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
		<!-- coloured overlay (mirrors the input, no caret) -->
		<SegmentOverlay spans={overlaySpans} {scrollLeft} class={control.class} span={spanSnippet} />

		<!-- real input: transparent text, visible caret -->
		<input
			bind:this={inputEl}
			type="text"
			inputmode="tel"
			{disabled}
			{readonly}
			class={cn(
				INPUT_OVERLAY_FIELD_CLASS,
				'text-transparent placeholder:text-transparent',
				control.class
			)}
			{...control.attrs}
			oninput={handleInput}
			onkeydown={handleKeydown}
			{onchange}
			onpaste={handlePaste}
			onscroll={syncScroll}
			onfocus={handleFocus}
			onblur={handleBlur}
		/>
	</span>
{/snippet}

{#snippet freeInput()}
	<!-- Free mode: plain input -->
	<!-- value is an attribute, not a binding: handleInput is the sole writer -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode="tel"
		{value}
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			'h-full w-full flex-1 bg-transparent px-2 font-mono text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
			'text-foreground placeholder:text-muted-foreground',
			control.class
		)}
		{...control.attrs}
		oninput={handleInput}
		{onchange}
		onpaste={handlePaste}
	/>
{/snippet}
