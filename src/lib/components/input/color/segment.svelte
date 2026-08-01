<script lang="ts">
	// This segment is a `contenteditable` field whose text is managed imperatively: setting
	// `textContent` (rather than binding it) is required to avoid Svelte re-rendering fighting the
	// caret position on every keystroke. The no-dom-manipulating rule doesn't fit this pattern.
	/* eslint-disable svelte/no-dom-manipulating */
	import { untrack } from 'svelte';
	import { clamp as clampRange } from '$svelte-atoms/core/utils/math';
	import type { ColorSegmentProps } from './types';

	let {
		value = undefined,
		channel,
		disabled = false,
		readonly = false,
		class: klass = '',
		onchange,
		oncommit,
		onfocusmove
	}: ColorSegmentProps = $props();

	let el = $state<HTMLSpanElement>();

	const isHex = $derived(channel.kind === 'hex');
	const minWidth = $derived(
		isHex
			? 2
			: Math.max(
					3,
					(channel.precision ?? 0) +
						Math.ceil(Math.log10(Math.abs(channel.max) + 1)) +
						(channel.suffix?.length ?? 0)
				)
	);

	function formatValue(v: number | string | undefined): string {
		if (v === undefined) return '';
		if (isHex) return String(v).padStart(2, '0').toUpperCase();
		const num = typeof v === 'string' ? parseFloat(v) : v;
		if (isNaN(num)) return '';
		const prec = channel.precision ?? 0;
		return prec > 0 ? num.toFixed(prec) : String(Math.round(num));
	}

	// Text shown when not focused; falls back to the channel label when empty.
	const displayText = $derived.by(() => {
		const fmt = formatValue(value);
		if (!fmt) return channel.label;
		return channel.suffix ? fmt + channel.suffix : fmt;
	});

	const hasValue = $derived(value !== undefined);

	let isFocused = $state(false);

	// Keep DOM text in sync with displayText, but never clobber it while editing.
	$effect(() => {
		if (!el || isFocused) return;
		void displayText;
		untrack(() => {
			if (el && el.textContent !== displayText) el.textContent = displayText;
		});
	});

	const clamp = (v: number) => clampRange(v, channel.min, channel.max);

	// Parse el.textContent into a channel value (stripping the suffix first).
	function parseContent(): number | string | undefined {
		let raw = (el?.textContent ?? '').trim();
		if (channel.suffix && raw.endsWith(channel.suffix)) {
			raw = raw.slice(0, -channel.suffix.length).trim();
		}
		if (isHex) {
			return /^[0-9a-fA-F]{1,2}$/.test(raw) ? raw.padStart(2, '0').toUpperCase() : undefined;
		}
		const n = parseFloat(raw);
		return isNaN(n) ? undefined : clamp(n);
	}

	function commit(ev: Event | null, andAdvance = false) {
		const parsed = parseContent();
		if (ev) {
			onchange?.(parsed);
			oncommit?.(ev, parsed);
		} else {
			onchange?.(parsed);
		}
		if (andAdvance) onfocusmove?.(1);
	}

	function step(dir: 1 | -1, multiplier = 1) {
		if (isHex) {
			const cur =
				typeof value === 'string' ? parseInt(value, 16) : ((value as number | undefined) ?? 0);
			onchange?.(
				clamp(cur + dir * multiplier)
					.toString(16)
					.padStart(2, '0')
					.toUpperCase()
			);
		} else {
			const cur = typeof value === 'number' ? value : parseFloat(String(value ?? channel.min));
			const prec = channel.precision ?? 0;
			const inc = prec > 0 ? Math.pow(10, -prec) : 1;
			onchange?.(clamp(parseFloat((cur + dir * inc * multiplier).toFixed(prec + 1))));
		}
	}

	function handleFocus() {
		isFocused = true;
		if (el) {
			el.textContent = formatValue(value) || '';
			// Place caret at end
			const sel = window.getSelection();
			if (sel && el.firstChild) {
				const range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	}

	function handleBlur(ev: FocusEvent) {
		isFocused = false;
		commit(ev, false);
		requestAnimationFrame(() => {
			if (el && !isFocused) el.textContent = displayText;
		});
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (disabled || readonly) return;

		const { key } = ev;

		const isAllowedChar = isHex
			? /^[0-9a-fA-F]$/i.test(key)
			: (key >= '0' && key <= '9') || key === '.' || key === '-';

		if (key.length === 1 && !isAllowedChar && !ev.ctrlKey && !ev.metaKey) {
			ev.preventDefault();
			return;
		}

		if (key === 'ArrowUp' || key === 'ArrowDown') {
			ev.preventDefault();
			const dir = key === 'ArrowUp' ? 1 : -1;
			const multiplier = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
			step(dir, multiplier);
			requestAnimationFrame(() => {
				if (el && isFocused) el.textContent = formatValue(value);
			});
			return;
		}

		if (key === 'ArrowLeft') {
			const sel = window.getSelection();
			if (sel?.rangeCount) {
				const range = sel.getRangeAt(0);
				if (range.startOffset === 0 && range.collapsed) {
					ev.preventDefault();
					commit(ev, false);
					onfocusmove?.(-1);
				}
			}
			return;
		}

		if (key === 'ArrowRight') {
			const sel = window.getSelection();
			if (sel?.rangeCount && el) {
				const range = sel.getRangeAt(0);
				const len = el.textContent?.length ?? 0;
				if (range.endOffset === len && range.collapsed) {
					ev.preventDefault();
					commit(ev, false);
					onfocusmove?.(1);
				}
			}
			return;
		}

		if (key === 'Enter') {
			ev.preventDefault();
			commit(ev, false);
			return;
		}
		if (key === 'Tab') {
			commit(ev, false);
			return;
		}

		if ((key === 'Backspace' || key === 'Delete') && !el?.textContent?.trim()) {
			ev.preventDefault();
			onchange?.(undefined);
		}
	}

	// Sanitize pasted text to the channel's allowed characters before inserting.
	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const raw = ev.clipboardData?.getData('text/plain') ?? '';
		const allowed = isHex
			? raw.replace(/[^0-9a-fA-F]/gi, '').slice(0, 2)
			: raw.replace(/[^0-9.-]/g, '');
		if (!allowed || !el) return;

		// Insert at cursor via Selection API (no execCommand)
		const sel = window.getSelection();
		if (!sel || !sel.rangeCount) {
			el.textContent = allowed;
		} else {
			const range = sel.getRangeAt(0);
			range.deleteContents();
			const node = document.createTextNode(allowed);
			range.insertNode(node);
			range.setStartAfter(node);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

	export function focus() {
		el?.focus();
	}
</script>

<span
	bind:this={el}
	role="spinbutton"
	tabindex={disabled ? -1 : 0}
	contenteditable={!disabled && !readonly ? 'plaintext-only' : undefined}
	spellcheck={false}
	aria-label={channel.label}
	aria-disabled={disabled}
	class={[
		'inline-flex items-center justify-center px-0.5 text-center font-mono tabular-nums text-sm',
		`min-w-[${minWidth}ch]`,
		'focus:bg-foreground/10 focus:outline-none focus:rounded-sm',
		hasValue ? 'text-foreground' : 'text-muted-foreground',
		disabled && 'cursor-not-allowed opacity-50',
		klass
	]
		.filter(Boolean)
		.join(' ')}
	onfocus={handleFocus}
	onblur={handleBlur}
	oninput={() => {
		/* filtered in keydown; DOM read on commit */
	}}
	onkeydown={handleKeydown}
	onpaste={handlePaste}>{displayText}</span
>
