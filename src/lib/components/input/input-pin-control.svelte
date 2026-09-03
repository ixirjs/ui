<!--
  One real <input> spanning the whole field, painted transparent, with the visible cells rendered
  behind it as aria-hidden decoration.

  The earlier shape was one <input> per digit with native input suppressed and every key handled in
  `keydown`. That reimplemented text editing — caret movement, selection, backspace, undo — and
  still lost the things only a real field gets: iOS one-time-code autofill and password managers
  both need a single element with the whole value, native paste arrives as an input event rather
  than N synthetic writes, and IME never sees a field it can compose into. Keeping one input hands
  all of that back to the browser, so the code here is only sanitising and cell rendering.
-->
<script lang="ts">
	import { useControl, INPUT_DISABLED_CLASS } from './shared';
	import { cn } from '$ixirjs/ui/utils';
	import type { InputChangeReason, InputPinControlProps } from './types';

	let {
		class: klass = '',
		value = $bindable(''),
		name = undefined,
		length = 6,
		type = 'numeric',
		groupSize = undefined,
		placeholder = '·',
		ariaLabel = 'One-time password',
		disabled = false,
		readonly = false,
		// manifest key keeps the pre-rename name so existing presets stay valid
		preset: presetKey = 'input.otp',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		oncomplete = undefined,
		...restProps
	}: InputPinControlProps = $props();

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		type: () => 'text'
	});

	let inputEl = $state<HTMLInputElement>();
	let isFocused = $state(false);
	// Mirrors the input's selection so the cells can show which one the caret is in. Kept in state
	// rather than read during render because selection changes fire no reactive signal of their own.
	let selStart = $state(0);
	let selEnd = $state(0);

	const cells = $derived(Array.from({ length }, (_, i) => value?.[i] ?? ''));
	const isFull = $derived(value.length >= length);

	// Tracks previous full state so oncomplete fires only once per fill.
	let wasFull = false;

	function isValidChar(char: string): boolean {
		if (type === 'numeric') return /^\d$/.test(char);
		if (type === 'alpha') return /^[a-zA-Z]$/.test(char);
		return /^[a-zA-Z0-9]$/.test(char); // alphanumeric
	}

	function normalizeChar(char: string): string {
		return type !== 'numeric' ? char.toUpperCase() : char;
	}

	// Drops anything the pin type disallows and stops at `length`. Runs over whatever the browser
	// put in the field, so it covers typing, paste, autofill and drop with one pass.
	//
	// This is also why the input carries no `maxlength`: the browser counts rejected characters
	// against it, so typing "12a34" into a 4-slot numeric pin would hit the cap at "12a3" and
	// sanitise down to "123". Length is enforced here, over valid characters only.
	function sanitize(raw: string): string {
		let next = '';
		for (const char of raw) {
			if (!isValidChar(char)) continue;
			next += normalizeChar(char);
			if (next.length === length) break;
		}
		return next;
	}

	function syncSelection() {
		if (!inputEl) return;
		selStart = inputEl.selectionStart ?? 0;
		selEnd = inputEl.selectionEnd ?? 0;
	}

	function emit(event: Event, reason: InputChangeReason) {
		control.notify(onvaluechange, value, event, reason);
		if (isFull && !wasFull) oncomplete?.(value);
		wasFull = isFull;
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		const el = event.currentTarget as HTMLInputElement;
		const next = sanitize(el.value);
		// Only write back when sanitising actually rejected something — an unconditional write would
		// reset the caret on every keystroke, and would cut an IME composition short.
		if (el.value !== next) el.value = next;

		value = next;
		control.setValue(next);
		syncSelection();
		emit(event, (event as InputEvent).inputType === 'insertFromPaste' ? 'paste' : 'input');
	}

	// Which cells to mark active: the caret's cell, or every cell inside a selection range.
	function isActive(index: number): boolean {
		if (!isFocused) return false;
		if (selStart === selEnd) return index === Math.min(selStart, length - 1);
		return index >= selStart && index < selEnd;
	}
</script>

<span
	class={cn(
		'relative inline-flex items-center gap-1',
		control.isComposed && 'h-full px-1 py-1',
		disabled && INPUT_DISABLED_CLASS,
		control.class
	)}
	{...control.attrs}
>
	<!--
	  The field itself. Transparent rather than hidden: a display:none or zero-size input is skipped
	  by autofill and password managers, which is the whole reason this element exists.
	-->
	<input
		bind:this={inputEl}
		type="text"
		inputmode={type === 'numeric' ? 'numeric' : 'text'}
		autocomplete="one-time-code"
		spellcheck={false}
		autocapitalize="off"
		{name}
		{value}
		{disabled}
		{readonly}
		aria-label={ariaLabel}
		class="absolute inset-0 z-10 h-full w-full bg-transparent text-center font-mono tracking-[1em] text-transparent caret-transparent outline-none"
		oninput={handleInput}
		{onchange}
		onfocus={() => {
			isFocused = true;
			syncSelection();
		}}
		onblur={() => (isFocused = false)}
		onkeyup={syncSelection}
		onpointerup={syncSelection}
		onselect={syncSelection}
	/>

	{#each cells as char, i (i)}
		{@render (groupSize !== undefined && i > 0 && i % groupSize === 0
			? control.isComposed
				? groupRule
				: groupDash
			: undefined)?.()}

		{@render cell(char, i)}
	{/each}
</span>

<!--
  Cells are decoration: the input above already carries the value and the accessible name, so
  announcing these too would read the pin out twice.
-->
{#snippet cell(char: string, i: number)}
	<div
		aria-hidden="true"
		data-filled={char !== ''}
		data-active={isActive(i)}
		class={cn(
			'flex shrink-0 items-center justify-center rounded-md',
			control.isComposed ? 'h-full flex-1' : 'h-10 w-7',
			'font-mono text-sm font-medium tabular-nums transition-colors duration-150',
			!control.isComposed && 'border-border bg-input border',
			char === '' ? 'text-muted-foreground' : 'text-foreground',
			isActive(i) && 'bg-foreground/5',
			isActive(i) && !control.isComposed && 'border-foreground/40 ring-foreground/20 ring-2'
		)}
	>
		{char === '' ? placeholder : char}
	</div>
{/snippet}

{#snippet groupRule()}
	<span class="bg-border h-5 w-px shrink-0 select-none"></span>
{/snippet}

{#snippet groupDash()}
	<span class="text-muted-foreground px-0.5 select-none">—</span>
{/snippet}
