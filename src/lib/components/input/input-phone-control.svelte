<script lang="ts">
	import { resolveControlPreset, writeInputValue } from './shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import { InputBond } from './bond.svelte';
	import type {
		InputPhoneControlProps,
		PhoneSpan as Span,
		PhoneSpanType as SpanType
	} from './types';

	const bond = InputBond.get();

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
		span: spanSnippet = undefined,
		...restProps
	}: InputPhoneControlProps = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	let inputEl = $state<HTMLInputElement>();
	let scrollLeft = $state(0);
	let isFocused = $state(false);

	// Format token parser
	// `#` = required digit, `[#]` = optional digit, anything else = literal.
	// A literal is "optional" when bounded by optional digits on both sides;
	// optional literals/digits render only once an optional digit in the group is filled.

	type Token =
		| { type: 'digit'; optional: boolean; slotIndex: number }
		| { type: 'lit'; char: string; optional: boolean };

	function parseFormat(fmt: string): Token[] {
		const tokens: Token[] = [];
		let i = 0;
		let slotIndex = 0;
		// lex tokens
		while (i < fmt.length) {
			if (fmt[i] === '[' && fmt[i + 1] === '#' && fmt[i + 2] === ']') {
				tokens.push({ type: 'digit', optional: true, slotIndex: slotIndex++ });
				i += 3;
			} else if (fmt[i] === '#') {
				tokens.push({ type: 'digit', optional: false, slotIndex: slotIndex++ });
				i++;
			} else {
				tokens.push({ type: 'lit', char: fmt[i]!, optional: false });
				i++;
			}
		}

		// a literal is optional iff the nearest digit on both sides is optional
		for (let j = 0; j < tokens.length; j++) {
			const t = tokens[j]!;
			if (t.type !== 'lit') continue;
			let leftOpt = false;
			for (let k = j - 1; k >= 0; k--) {
				const tk = tokens[k]!;
				if (tk.type === 'digit') {
					leftOpt = tk.optional;
					break;
				}
			}
			let rightOpt = false;
			for (let k = j + 1; k < tokens.length; k++) {
				const tk = tokens[k]!;
				if (tk.type === 'digit') {
					rightOpt = tk.optional;
					break;
				}
			}
			t.optional = leftOpt && rightOpt;
		}

		return tokens;
	}

	const tokens = $derived(format ? parseFormat(format) : []);
	const maxDigits = $derived(tokens.filter((t) => t.type === 'digit').length);

	// Build masked string from digits + tokens
	// empty: filler for an unfilled required slot ('_' to display, '' to measure)
	function buildMasked(digits: string, empty = '_'): string {
		let out = '';
		for (const t of tokens) {
			if (t.type === 'digit') {
				const ch = digits[t.slotIndex];
				if (ch !== undefined) {
					out += ch;
				} else if (!t.optional) {
					out += empty;
				}
				// optional + unfilled = emit nothing
			} else {
				if (!t.optional) {
					out += t.char;
				} else {
					// optional literal shows only if any optional slot is filled
					const adjacentFilled = tokens.some(
						(tok) => tok.type === 'digit' && tok.optional && digits[tok.slotIndex] !== undefined
					);
					if (adjacentFilled) out += t.char;
				}
			}
		}
		return out;
	}

	// Position of the next empty slot in the masked string
	function nextCursorPos(digits: string): number {
		const anyOptFilled = tokens.some(
			(t) => t.type === 'digit' && t.optional && digits[t.slotIndex] !== undefined
		);
		let pos = 0;
		for (const t of tokens) {
			if (t.type === 'digit') {
				const filled = digits[t.slotIndex] !== undefined;
				if (t.optional && !filled && !anyOptFilled) continue; // not rendered, skip
				if (!filled) return pos; // next empty slot in rendered string
				pos++;
			} else {
				const willRender = !t.optional || anyOptFilled;
				if (willRender) pos++;
			}
		}
		return pos; // all filled
	}

	// Segment color map
	const segmentColors: Record<string, string> = {
		country: 'var(--input-hl-accent, var(--foreground))',
		area: 'var(--foreground)',
		prefix: 'var(--input-hl-secondary, var(--foreground))',
		line: 'var(--foreground)',
		other: 'var(--foreground)'
	};

	const digitSlotKind = $derived.by<string[]>(() => {
		const kinds: string[] = [];
		if (segmentMap) {
			for (const [kind, count] of Object.entries(segmentMap)) {
				for (let i = 0; i < (count as number); i++) kinds.push(kind);
			}
		}
		while (kinds.length < maxDigits) kinds.push('other');
		return kinds;
	});

	// Overlay spans — PhoneSpan/PhoneSpanType are the single source of truth in ./types.

	const overlaySpans = $derived.by<Span[]>(() => {
		if (!format) return [];
		const spans: Span[] = [];

		for (const t of tokens) {
			if (t.type === 'digit') {
				const filled = value[t.slotIndex] !== undefined;
				if (!filled && t.optional) continue;
				const ch = filled ? value[t.slotIndex]! : '_';
				const kind = (digitSlotKind[t.slotIndex] ?? 'other') as SpanType;
				const spanType: SpanType = filled ? kind : 'empty';
				const spanStyle = filled
					? segmentMap
						? `color: ${segmentColors[kind] ?? segmentColors['other']}`
						: 'color: var(--foreground)'
					: 'color: color-mix(in oklch, var(--muted-foreground) 40%, transparent)';
				spans.push({ text: ch, class: '', style: spanStyle, type: spanType });
			} else {
				if (t.optional) {
					const anyOptFilled = tokens.some(
						(tok) => tok.type === 'digit' && tok.optional && value[tok.slotIndex] !== undefined
					);
					if (!anyOptFilled) continue;
				}
				spans.push({ text: t.char, class: 'text-muted-foreground', type: 'lit' });
			}
		}

		// merge consecutive same-type spans (keeps type for the snippet)
		return spans.reduce<Span[]>((acc, s) => {
			const last = acc[acc.length - 1];
			if (last && last.type === s.type) {
				last.text += s.text;
				return acc;
			}
			return [...acc, { ...s }];
		}, []);
	});

	// Sync external value → display + caret
	$effect(() => {
		if (!format || !inputEl) return;
		const masked = value || isFocused ? buildMasked(value) : '';
		if (inputEl.value !== masked) inputEl.value = masked;
		// re-place caret via rAF to beat the browser's own placement
		if (isFocused) {
			const pos = nextCursorPos(value);
			requestAnimationFrame(() => inputEl?.setSelectionRange(pos, pos));
		}
	});

	// Input handler
	function handleInput(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;

		if (!format) {
			value = input.value;
			writeInputValue(bond, value);
			oninput?.(ev, { value });
			return;
		}

		const digits = input.value.replace(/\D/g, '').slice(0, maxDigits);
		input.value = buildMasked(digits);
		scrollLeft = input.scrollLeft;
		value = digits;
		writeInputValue(bond, value);
		oninput?.(ev, { value });
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (!format) return;
		if (ev.key === 'Backspace') {
			ev.preventDefault();
			if (!value) return;
			const next = value.slice(0, -1);
			if (inputEl) inputEl.value = next ? buildMasked(next) : buildMasked('');
			value = next;
			writeInputValue(bond, value);
			oninput?.(undefined as unknown as Event, { value });
		} else if (ev.key === 'Delete') {
			ev.preventDefault();
			// clear forward from the digit slot at/after the cursor
			if (!value || !inputEl) return;
			const pos = inputEl.selectionStart ?? 0;
			let charPos = 0;
			for (const t of tokens) {
				if (t.type === 'digit') {
					const filled = value[t.slotIndex] !== undefined;
					if (!filled && t.optional) continue;
					if (charPos >= pos) {
						const next = value.slice(0, t.slotIndex);
						if (inputEl) inputEl.value = next ? buildMasked(next) : buildMasked('');
						value = next;
						writeInputValue(bond, value);
						oninput?.(undefined as unknown as Event, { value });
						return;
					}
					charPos++;
				} else {
					const willRender =
						!t.optional ||
						tokens.some(
							(tok) => tok.type === 'digit' && tok.optional && value[tok.slotIndex] !== undefined
						);
					if (willRender) charPos++;
				}
			}
		} else if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !/\d/.test(ev.key)) {
			// block non-digit printable keys: no input event, caret stays put
			ev.preventDefault();
		}
	}

	function handleChange(ev: Event) {
		onchange?.(ev, { value });
	}

	// Paste handler
	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const pasted = ev.clipboardData?.getData('text') ?? '';

		if (!format) {
			// free mode: insert at caret
			const input = ev.currentTarget as HTMLInputElement;
			const start = input.selectionStart ?? value.length;
			const end = input.selectionEnd ?? value.length;
			value = value.slice(0, start) + pasted + value.slice(end);
			writeInputValue(bond, value);
			oninput?.(ev, { value });
			onchange?.(ev, { value });
			return;
		}

		// mask mode: keep digits only, clamp to maxDigits
		const digits = pasted.replace(/\D/g, '').slice(0, maxDigits);
		if (!digits) return;
		value = digits;
		if (inputEl) inputEl.value = buildMasked(digits);
		writeInputValue(bond, value);
		oninput?.(ev, { value });
		onchange?.(ev, { value });
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

{#snippet defaultSpan(span: Span, _index: number)}
	<span style={span.style}>{span.text}</span>
{/snippet}

{#if format}
	<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
		<!-- coloured overlay (mirrors the input, no caret) -->
		<span
			aria-hidden="true"
			class={cn(
				'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-2 font-mono text-sm',
				preset?.class,
				toClassValue(klass, bond)
			)}
		>
			<span style="transform: translateX(-{scrollLeft}px)">
				{#each overlaySpans as span, i (span)}
					{@render (spanSnippet ?? defaultSpan)(span, i)}
				{/each}
			</span>
		</span>

		<!-- real input: transparent text, visible caret -->
		<input
			bind:this={inputEl}
			type="text"
			inputmode="tel"
			{disabled}
			{readonly}
			class={cn(
				'relative h-full w-full flex-1 bg-transparent px-2 font-mono text-sm text-transparent caret-foreground outline-none',
				'placeholder:text-transparent',
				disabled && 'cursor-not-allowed opacity-50',
				preset?.class,
				toClassValue(klass, bond)
			)}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onchange={handleChange}
			onpaste={handlePaste}
			onscroll={syncScroll}
			onfocus={handleFocus}
			onblur={handleBlur}
			{...restProps}
		/>
	</span>
{:else}
	<!-- Free mode: plain input -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode="tel"
		bind:value
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			'h-full w-full flex-1 bg-transparent px-2 font-mono text-sm outline-none',
			'text-foreground placeholder:text-muted-foreground',
			disabled && 'cursor-not-allowed opacity-50',
			preset?.class,
			toClassValue(klass, bond)
		)}
		oninput={handleInput}
		onchange={handleChange}
		onpaste={handlePaste}
		{...restProps}
	/>
{/if}
