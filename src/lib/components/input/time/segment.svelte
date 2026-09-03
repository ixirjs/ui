<script lang="ts">
	import { INPUT_DISABLED_CLASS } from '../shared';
	// This segment is a `contenteditable` field whose text is managed imperatively: setting
	// `textContent` (rather than binding it) is required to avoid Svelte re-rendering fighting the
	// caret position on every keystroke. The no-dom-manipulating rule doesn't fit this pattern.
	/* eslint-disable svelte/no-dom-manipulating */
	import { untrack } from 'svelte';
	import { clamp as clampRange } from '$ixirjs/ui/utils/math';
	import type { SegmentProps } from './shared';

	let {
		value = $bindable<number | undefined>(undefined),
		min,
		max,
		digits = 2,
		placeholder,
		disabled = false,
		readonly = false,
		class: klass = '',
		onchange,
		oninput,
		onvaluechange,
		onfocusmove,
		onrollover
	}: SegmentProps = $props();

	let el = $state<HTMLSpanElement>();
	let buffer = $state('');

	const displayPlaceholder = $derived(placeholder ?? '—'.repeat(digits));

	const isEmpty = $derived(value === undefined && buffer === '');

	const display = $derived(
		buffer !== ''
			? buffer.padStart(digits, '_')
			: value !== undefined
				? String(value).padStart(digits, '0')
				: displayPlaceholder
	);

	// Rendered once (plain const, not reactive) so SSR/first paint show the real value instead of a
	// placeholder that the effect below then swaps out a frame later.
	const initialDisplay = untrack(() => display);

	// Only the text is written imperatively — binding it would fight the caret on every keystroke.
	// aria-*, data-empty and the empty/filled colour are ordinary attributes in the markup below.
	$effect(() => {
		const text = display;
		untrack(() => {
			requestAnimationFrame(() => {
				if (el && el.textContent !== text) el.textContent = text;
			});
		});
	});

	const clamp = (v: number) => clampRange(v, min, max);

	function commitBuffer(buf: string, andAdvance: boolean, event: Event) {
		const n = parseInt(buf, 10);
		if (!isNaN(n)) {
			value = clamp(n);
			onvaluechange?.(value, { event, reason: 'input' });
		}
		buffer = '';
		if (andAdvance) onfocusmove?.(1);
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (disabled || readonly) return;

		if (ev.key >= '0' && ev.key <= '9') {
			ev.preventDefault();
			const next = buffer + ev.key;
			const nextNum = parseInt(next, 10);

			if (next.length === 1 && nextNum > max) return;

			if (next.length === digits) {
				commitBuffer(nextNum <= max ? next : String(max), true, ev);
				return;
			}

			buffer = next;

			const minCompletion = parseInt(next + '0'.repeat(digits - next.length), 10);
			if (minCompletion > max) commitBuffer(next, true, ev);
		} else if (ev.key === 'ArrowUp') {
			ev.preventDefault();
			buffer = '';
			const cur = value ?? min;
			if (cur >= max) {
				value = min;
				onvaluechange?.(value, { event: ev, reason: 'step' });
				onrollover?.(1, { event: ev, reason: 'rollover' });
			} else {
				value = cur + 1;
				onvaluechange?.(value, { event: ev, reason: 'step' });
			}
		} else if (ev.key === 'ArrowDown') {
			ev.preventDefault();
			buffer = '';
			const cur = value ?? max;
			if (cur <= min) {
				value = max;
				onvaluechange?.(value, { event: ev, reason: 'step' });
				onrollover?.(-1, { event: ev, reason: 'rollover' });
			} else {
				value = cur - 1;
				onvaluechange?.(value, { event: ev, reason: 'step' });
			}
		} else if (ev.key === 'ArrowLeft') {
			ev.preventDefault();
			if (buffer) buffer = '';
			else onfocusmove?.(-1);
		} else if (ev.key === 'ArrowRight') {
			ev.preventDefault();
			onfocusmove?.(1);
		} else if (ev.key === 'Backspace' || ev.key === 'Delete') {
			ev.preventDefault();
			if (buffer) buffer = buffer.slice(0, -1);
			else {
				value = undefined;
				onvaluechange?.(value, { event: ev, reason: 'clear' });
			}
		} else if (ev.key === 'Tab') {
			buffer = '';
		} else if (!ev.ctrlKey && !ev.metaKey && !ev.altKey) {
			ev.preventDefault();
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
	contenteditable={!disabled && !readonly}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext={display}
	aria-label={placeholder}
	aria-disabled={disabled}
	data-empty={isEmpty}
	class={[
		'inline-flex min-w-[2ch] items-center justify-center px-0.5 text-center font-mono tabular-nums',
		'focus:bg-foreground/10 focus:outline-none',
		isEmpty ? 'text-muted-foreground' : 'text-foreground',
		disabled && INPUT_DISABLED_CLASS,
		klass
	]}
	oninput={(event) => oninput?.(event)}
	onchange={(event) => onchange?.(event)}
	onkeydown={handleKeydown}
	onpaste={(ev) => ev.preventDefault()}
	onblur={(event) => {
		if (buffer) commitBuffer(buffer, false, event);
	}}>{initialDisplay}</span
>
