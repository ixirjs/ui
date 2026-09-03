<script lang="ts">
	import { useControl, INPUT_DISABLED_CLASS } from '../shared';
	import HiddenInput from '../hidden-input.svelte';
	import { cn } from '$ixirjs/ui/utils';
	import { clamp } from '$ixirjs/ui/utils/math';
	import { untrack } from 'svelte';
	import { createParsedValue } from '../parsed-value.svelte';
	import type { DateTimeControlImplProps } from './types';
	import Segment from './segment.svelte';
	import {
		parseDateTimeString,
		parseDateString,
		buildDateTimeValue,
		buildDateValue,
		maxDaysInMonth,
		mergeParts,
		addMonth,
		carryDateTime,
		type DateTimeParts
	} from './shared';

	let {
		class: klass = '',
		value = $bindable(''),
		name = undefined,
		date = $bindable<Date | undefined>(undefined),
		mode = 'datetime',
		withSeconds = false,
		disabled = false,
		readonly = false,
		preset: presetKey = undefined,
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: DateTimeControlImplProps = $props();

	const isDateOnly = $derived(mode === 'date');
	const resolvedPresetKey = $derived(presetKey ?? (isDateOnly ? 'input.date' : 'input.datetime'));

	// Registers the segment wrapper; the declared type follows `mode`, which is why it is an
	// accessor rather than a value.
	const control = useControl({
		preset: () => resolvedPresetKey,
		restProps: () => restProps,
		class: () => klass,
		type: () => (isDateOnly ? 'date' : 'datetime-local')
	});

	const parsedValue = createParsedValue<string, Date | undefined>({
		raw: { get: () => value, set: (next) => (value = next) },
		parsed: { get: () => date, set: (next) => (date = next) },
		parse: (raw) => {
			if (!raw) return { value: undefined };
			const parsed = new Date(isDateOnly ? `${raw}T00:00:00` : raw);
			return Number.isNaN(parsed.getTime()) ? undefined : { value: parsed };
		},
		format: (parsed) => {
			if (!parsed) return '';
			const pad = (part: number) => String(part).padStart(2, '0');
			const datePart = `${String(parsed.getFullYear()).padStart(4, '0')}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
			if (isDateOnly) return datePart;
			const time = `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
			return withSeconds
				? `${datePart}T${time}:${pad(parsed.getSeconds())}`
				: `${datePart}T${time}`;
		},
		preferRaw: (raw) => raw !== '',
		equalsParsed: (left, right) => left?.getTime() === right?.getTime(),
		onRawChange: (raw) => control.setValue(raw)
	});

	const parsedParts = $derived(isDateOnly ? parseDateString(value) : parseDateTimeString(value));

	// Source of truth for segment rendering: segments write here immediately,
	// even when the full value can't yet be built. Synced from external value changes.
	let draftParts = $state<DateTimeParts>({});

	$effect(() => {
		const p = parsedParts;
		untrack(() => {
			draftParts = { ...p };
		});
	});

	const { year, month, day, hours, minutes, seconds } = $derived(draftParts);

	const maxDay = $derived(maxDaysInMonth(month, year));

	let segMonth = $state<{ focus(): void }>();
	let segDay = $state<{ focus(): void }>();
	let segYear = $state<{ focus(): void }>();
	let segHours = $state<{ focus(): void }>();
	let segMinutes = $state<{ focus(): void }>();
	let segSeconds = $state<{ focus(): void }>();

	const segments = $derived(
		isDateOnly
			? [segMonth, segDay, segYear]
			: withSeconds
				? [segMonth, segDay, segYear, segHours, segMinutes, segSeconds]
				: [segMonth, segDay, segYear, segHours, segMinutes]
	);

	function emit(ev: Event | undefined, overrides: DateTimeParts = {}) {
		// Always update draft so segments don't revert
		const merged = mergeParts(draftParts, overrides);
		draftParts = merged;

		const v = isDateOnly ? buildDateValue(merged) : buildDateTimeValue(merged, withSeconds);

		// Only emit when a complete, valid string can be built
		if (!v || v === value) return;

		parsedValue.setRaw(v);
		control.notify(onvaluechange, value, ev, 'input', { date });
	}

	// Every segment reports `number | undefined`; only a defined value is worth merging, and an
	// undefined one still re-emits so the draft survives. Six copies of the same three lines.
	function emitPart(key: keyof DateTimeParts) {
		return (v: number | undefined, context: { event?: Event }) =>
			emit(context.event, v === undefined ? {} : { [key]: v });
	}

	// The year a rollover carries from when the year segment is still empty.
	const currentYear = new Date().getFullYear();

	function moveFocus(from: number, dir: -1 | 1) {
		segments[from + dir]?.focus();
	}

	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const text = ev.clipboardData?.getData('text') ?? '';

		if (isDateOnly) {
			// Accept YYYY-MM-DD only
			const m = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
			if (!m) return;
			const yr = parseInt(m[1]!, 10);
			const mo = clamp(parseInt(m[2]!, 10), 1, 12);
			emit(ev, {
				year: yr,
				month: mo,
				day: clamp(parseInt(m[3]!, 10), 1, maxDaysInMonth(mo, yr))
			});
			return;
		}

		const m = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
		if (!m) return;
		const overrides: DateTimeParts = {
			year: parseInt(m[1]!, 10),
			month: clamp(parseInt(m[2]!, 10), 1, 12)
		};
		// Clamp day to actual max for the parsed month/year
		const parsedYear = overrides.year;
		const parsedMonth = overrides.month;
		overrides.day = clamp(parseInt(m[3]!, 10), 1, maxDaysInMonth(parsedMonth, parsedYear));
		overrides.hours = m[4] ? Math.min(23, parseInt(m[4], 10)) : 0;
		overrides.minutes = m[5] ? Math.min(59, parseInt(m[5], 10)) : 0;
		if (withSeconds && m[6]) overrides.seconds = Math.min(59, parseInt(m[6], 10));
		emit(ev, overrides);
	}
</script>

<span
	class={cn(
		'flex h-full items-center gap-0 px-2 font-mono',
		disabled && INPUT_DISABLED_CLASS,
		control.class
	)}
	role="group"
	aria-label={mode === 'date' ? 'Date' : 'Date and time'}
	{...control.attrs}
	onpaste={handlePaste}
	{oninput}
	{onchange}
>
	<!-- Date: MM / DD / YYYY -->
	<Segment
		bind:this={segMonth}
		value={month}
		min={1}
		max={12}
		digits={2}
		placeholder="MM"
		{disabled}
		{readonly}
		onvaluechange={emitPart('month')}
		onfocusmove={(dir) => moveFocus(0, dir)}
		onrollover={(dir, context) => {
			// month rollover advances/retreats the year
			emit(context.event, { year: (year ?? currentYear) + dir, month: dir === 1 ? 1 : 12 });
		}}
	/>
	<span class="text-muted-foreground select-none">/</span>
	<Segment
		bind:this={segDay}
		value={day}
		min={1}
		max={maxDay}
		digits={2}
		placeholder="DD"
		{disabled}
		{readonly}
		onvaluechange={emitPart('day')}
		onfocusmove={(dir) => moveFocus(1, dir)}
		onrollover={(dir, context) => {
			// day rollover advances/retreats the month, landing on its first or last day
			const next = addMonth({ year, month }, dir, currentYear);
			const day = dir === 1 ? 1 : maxDaysInMonth(next.month, next.year);
			emit(context.event, { ...next, day });
		}}
	/>
	<span class="text-muted-foreground select-none">/</span>
	<Segment
		bind:this={segYear}
		value={year}
		min={1}
		max={9999}
		digits={4}
		placeholder="YYYY"
		{disabled}
		{readonly}
		onvaluechange={emitPart('year')}
		onfocusmove={(dir) => moveFocus(2, dir)}
	/>

	{@render (!isDateOnly ? dateTimeSeparator : undefined)?.()}

	<!-- Time: HH : MM [: SS] (datetime mode only) -->
	{@render (!isDateOnly ? timeSegments : undefined)?.()}
</span>

<HiddenInput {name} {value} />

{#snippet dateTimeSeparator()}
	<span class="text-muted-foreground mx-1 select-none">·</span>
{/snippet}

{#snippet timeSegments()}
	<Segment
		bind:this={segHours}
		value={hours}
		min={0}
		max={23}
		digits={2}
		placeholder="HH"
		{disabled}
		{readonly}
		onvaluechange={emitPart('hours')}
		onfocusmove={(dir) => moveFocus(3, dir)}
		onrollover={(dir, context) =>
			emit(context.event, carryDateTime(draftParts, 'hours', dir, currentYear))}
	/>
	<span class="text-muted-foreground select-none">:</span>
	<Segment
		bind:this={segMinutes}
		value={minutes}
		min={0}
		max={59}
		digits={2}
		placeholder="MM"
		{disabled}
		{readonly}
		onvaluechange={emitPart('minutes')}
		onfocusmove={(dir) => moveFocus(4, dir)}
		onrollover={(dir, context) =>
			emit(context.event, carryDateTime(draftParts, 'minutes', dir, currentYear))}
	/>
	{@render (withSeconds ? secondsSegment : undefined)?.()}
{/snippet}

{#snippet secondsSegment()}
	<span class="text-muted-foreground select-none">:</span>
	<Segment
		bind:this={segSeconds}
		value={seconds}
		min={0}
		max={59}
		digits={2}
		placeholder="SS"
		{disabled}
		{readonly}
		onvaluechange={emitPart('seconds')}
		onfocusmove={(dir) => moveFocus(5, dir)}
		onrollover={(dir, context) =>
			emit(context.event, carryDateTime(draftParts, 'seconds', dir, currentYear))}
	/>
{/snippet}
