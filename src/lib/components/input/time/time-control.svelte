<script lang="ts">
	import { useControl, INPUT_DISABLED_CLASS } from '$ixirjs/ui/components/input/shared';
	import HiddenInput from '../hidden-input.svelte';
	import { cn } from '$ixirjs/ui/utils';
	import { untrack } from 'svelte';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import { createParsedValue } from '../parsed-value.svelte';
	import type {
		InputTimeControlProps,
		InputNumber24HourControlProps,
		InputNumber12HourControlProps
	} from '$ixirjs/ui/components/input/types';
	import Segment from './segment.svelte';
	import {
		parseTimeString,
		buildTimeValue,
		clampTimeParts,
		mergeParts,
		displayToInternal,
		internalToDisplay,
		stepWrap,
		type TimeParts
	} from './shared';

	let {
		class: klass = '',
		value = $bindable(''),
		name = undefined,
		date = $bindable<Date | undefined>(undefined),
		hourFormat = 24,
		withSeconds = false,
		min = undefined,
		max = undefined,
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.time',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputTimeControlProps &
		(
			| InputNumber12HourControlProps
			| (Omit<InputNumber24HourControlProps, 'hourFormat'> & { hourFormat?: 24 })
		) = $props();

	// Registers the segment wrapper. It is not an <input>, so the semantic type is declared.
	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		type: () => 'time'
	});

	const parsedValue = createParsedValue<string, Date | undefined>({
		raw: { get: () => value, set: (next) => (value = next) },
		parsed: { get: () => date, set: (next) => (date = next) },
		parse: (raw) => {
			if (!raw) return { value: undefined };
			const parsed = parseTimeString(raw);
			if (parsed.hh === undefined || parsed.mm === undefined) return undefined;
			if (!date) return { value: undefined };
			const next = new Date(date);
			next.setHours(parsed.hh, parsed.mm, withSeconds ? (parsed.ss ?? 0) : 0, 0);
			return { value: next };
		},
		format: (parsed) =>
			parsed
				? buildTimeValue(
						{ hh: parsed.getHours(), mm: parsed.getMinutes(), ss: parsed.getSeconds() },
						withSeconds
					)
				: '',
		preferRaw: (raw) => raw !== '',
		equalsParsed: (left, right) => left?.getTime() === right?.getTime(),
		onRawChange: (raw) => control.setValue(raw)
	});

	const parts = $derived(
		parseTimeString(
			value,
			untrack(() => date),
			hourFormat
		)
	);
	const { hh, mm, ss, period: p } = $derived(parts);

	const displayHours = $derived(hh === undefined || hourFormat === 24 ? hh : internalToDisplay(hh));

	let segHours = $state<{ focus(): void }>();
	let segMinutes = $state<{ focus(): void }>();
	let segSeconds = $state<{ focus(): void }>();

	function emit(ev: Event | undefined, override: TimeParts = {}) {
		const merged: TimeParts = mergeParts(parts, override);
		const clamped = clampTimeParts(merged, min, max);
		const raw = buildTimeValue(clamped, withSeconds);
		if (!raw) return;

		if (raw === value) return;

		parsedValue.setRaw(raw);
		control.notify(onvaluechange, value, ev, 'input', { date });
	}

	function hourOverride(displayH: number, dir?: 1 | -1): TimeParts {
		if (hourFormat === 24) return { hh: displayH };
		let period = p ?? 'AM';
		if (
			(dir === 1 && displayHours === 11 && displayH === 12) ||
			(dir === -1 && displayHours === 12 && displayH === 11)
		) {
			period = period === 'AM' ? 'PM' : 'AM';
		}
		return { hh: displayToInternal(displayH, period), period };
	}

	// Convert display hours to internal 24h before emitting, including the AM/PM boundary.
	function handleHoursChange(displayH: number | undefined, context: StateChangeContext) {
		if (displayH === undefined) {
			emit(context.event);
			return;
		}
		const key = context.event instanceof KeyboardEvent ? context.event.key : '';
		const dir = key === 'ArrowUp' ? 1 : key === 'ArrowDown' ? -1 : undefined;
		emit(context.event, hourOverride(displayH, dir));
	}

	// Segments report `number | undefined`; only a defined value is worth merging.
	function emitPart(key: keyof TimeParts) {
		return (v: number | undefined, context: { event?: Event }) =>
			emit(context.event, v === undefined ? {} : { [key]: v });
	}

	// Step the displayed hour past its bound, in whichever format is active.
	function stepDisplayHours(dir: 1 | -1): number | undefined {
		if (displayHours === undefined) return undefined;
		return stepWrap(displayHours, hourFormat === 12 ? 1 : 0, hourFormat === 12 ? 12 : 23, dir);
	}

	function togglePeriod(event?: MouseEvent | KeyboardEvent) {
		if (disabled || readonly || hh === undefined) return;
		const newPeriod = p === 'AM' ? 'PM' : 'AM';
		const newHH = displayToInternal(displayHours ?? 12, newPeriod);
		emit(event, { hh: newHH, period: newPeriod });
	}

	function handlePeriodKey(ev: KeyboardEvent) {
		const { key } = ev;
		if (key.toLowerCase() === 'a') {
			const newHH = displayToInternal(displayHours ?? 12, 'AM');
			emit(ev, { hh: newHH, period: 'AM' });
		} else if (key.toLowerCase() === 'p') {
			const newHH = displayToInternal(displayHours ?? 12, 'PM');
			emit(ev, { hh: newHH, period: 'PM' });
		} else if (['ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(key)) {
			ev.preventDefault();
			togglePeriod(ev);
		} else if (key === 'ArrowLeft') {
			ev.preventDefault();
			(withSeconds ? segSeconds : segMinutes)?.focus();
		}
	}

	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const text = ev.clipboardData?.getData('text') ?? '';

		const m12 = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
		const m24 = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);

		const override: TimeParts = {};

		if (m12) {
			let h = parseInt(m12[1]!, 10);
			const isPM = m12[4]!.toUpperCase() === 'PM';
			if (isPM && h !== 12) h += 12;
			if (!isPM && h === 12) h = 0;
			override.hh = Math.min(23, h);
			override.mm = Math.min(59, parseInt(m12[2]!, 10));
			if (withSeconds && m12[3]) override.ss = Math.min(59, parseInt(m12[3], 10));
			override.period = isPM ? 'PM' : 'AM';
		} else if (m24) {
			const h = Math.min(23, parseInt(m24[1]!, 10));
			override.hh = h;
			override.mm = Math.min(59, parseInt(m24[2]!, 10));
			if (withSeconds && m24[3]) override.ss = Math.min(59, parseInt(m24[3], 10));
			if (hourFormat === 12) override.period = h >= 12 ? 'PM' : 'AM';
		}

		emit(ev, override);
	}
</script>

<span
	class={cn(
		'inline-flex h-full flex-1 items-center gap-0 px-2 font-mono',
		disabled && INPUT_DISABLED_CLASS,
		control.class
	)}
	role="group"
	aria-label="Time"
	{...control.attrs}
	onpaste={handlePaste}
	{oninput}
	{onchange}
>
	<Segment
		bind:this={segHours}
		value={displayHours}
		min={hourFormat === 12 ? 1 : 0}
		max={hourFormat === 12 ? 12 : 23}
		digits={2}
		placeholder="HH"
		{disabled}
		{readonly}
		onvaluechange={handleHoursChange}
		onfocusmove={(dir) => (dir === 1 ? segMinutes?.focus() : undefined)}
	/>

	<span class="text-muted-foreground select-none">:</span>

	<Segment
		bind:this={segMinutes}
		value={mm}
		min={0}
		max={59}
		digits={2}
		placeholder="MM"
		{disabled}
		{readonly}
		onvaluechange={emitPart('mm')}
		onfocusmove={(dir) => {
			if (dir === 1 && withSeconds) segSeconds?.focus();
			else if (dir === 1 && hourFormat === 12) {
				/* AM/PM is reached via Tab, not arrow */
			} else if (dir === -1) segHours?.focus();
		}}
		onrollover={(dir, context) => {
			const next = stepDisplayHours(dir);
			if (next !== undefined) handleHoursChange(next, context);
		}}
	/>

	{@render (withSeconds ? secondsField : undefined)?.()}

	{@render (hourFormat === 12 ? meridiemField : undefined)?.()}
</span>

<HiddenInput {name} {value} />

{#snippet secondsField()}
	<span class="text-muted-foreground select-none">:</span>
	<Segment
		bind:this={segSeconds}
		value={ss}
		min={0}
		max={59}
		digits={2}
		placeholder="SS"
		{disabled}
		{readonly}
		onvaluechange={emitPart('ss')}
		onfocusmove={(dir) => (dir === -1 ? segMinutes?.focus() : undefined)}
		onrollover={(dir, context) => {
			const nextMM = stepWrap(mm, 0, 59, dir);
			const nextH = nextMM === (dir === 1 ? 0 : 59) ? stepDisplayHours(dir) : undefined;
			emit(context.event, {
				mm: nextMM,
				...(nextH === undefined ? {} : hourOverride(nextH, dir))
			});
		}}
	/>
{/snippet}

{#snippet meridiemField()}
	<span class="ml-1 select-none"> </span>
	<span
		role="spinbutton"
		tabindex={disabled ? -1 : 0}
		aria-label="AM/PM"
		aria-valuenow={p === 'AM' ? 0 : 1}
		aria-valuemin={0}
		aria-valuemax={1}
		aria-valuetext={p}
		class={cn(
			'ml-auto inline-flex min-w-[3ch] cursor-pointer items-center justify-center px-0.5 font-sans text-sm font-medium',
			'focus:bg-foreground/10 focus:outline-none',
			disabled && INPUT_DISABLED_CLASS
		)}
		onclick={togglePeriod}
		onkeydown={handlePeriodKey}
	>
		{p ?? '--'}
	</span>
{/snippet}
