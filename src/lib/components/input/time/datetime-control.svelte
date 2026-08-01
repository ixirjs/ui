<script lang="ts">
	import { resolveControlPreset } from '../shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import { clamp } from '$svelte-atoms/core/utils/math';
	import { untrack } from 'svelte';
	import { InputBond } from '../bond.svelte';
	import type { InputDateTimeControlProps, InputDateControlProps } from '../types';
	import Segment from './segment.svelte';
	import {
		parseDateTimeString, parseDateString, buildDateTimeValue, buildDateValue,
		maxDaysInMonth, mergeParts,
		type DateTimeParts,
	} from './shared';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
		date = $bindable<Date | null>(null),
		mode = 'datetime',
		withSeconds = false,
		disabled = false,
		readonly = false,
		preset: presetKey = undefined,
		onchange = undefined,
		oninput = undefined,
		...restProps
	}: InputDateTimeControlProps | InputDateControlProps = $props();

	const isDateOnly = $derived(mode === 'date');
	const resolvedPresetKey = $derived(presetKey ?? (isDateOnly ? 'input.date' : 'input.datetime'));

	const preset = resolveControlPreset(() => resolvedPresetKey, bond);

	const parsedParts = $derived(
		isDateOnly ? parseDateString(value) : parseDateTimeString(value)
	);

	// Source of truth for segment rendering: segments write here immediately,
	// even when the full value can't yet be built. Synced from external value changes.
	let draftParts = $state<DateTimeParts>({});

	$effect(() => {
		const p = parsedParts;
		untrack(() => { draftParts = { ...p }; });
	});

	const { year, month, day, hours, minutes, seconds } = $derived(draftParts);

	const maxDay = $derived(maxDaysInMonth(month, year));

	let segMonth   = $state<{ focus(): void }>();
	let segDay     = $state<{ focus(): void }>();
	let segYear    = $state<{ focus(): void }>();
	let segHours   = $state<{ focus(): void }>();
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

		const v = isDateOnly
			? buildDateValue(merged)
			: buildDateTimeValue(merged, withSeconds);

		// Only emit when a complete, valid string can be built
		if (!v || v === value) return;

		value = v;
		date = new Date(isDateOnly ? v + 'T00:00:00' : v);
		if (isNaN(date.getTime())) date = null;
		if (bond) bond.state.props.value = value;

		const detail = { value, date };
		if (ev) onchange?.(ev, detail);
		else    oninput?.(undefined as unknown as Event, detail);
	}

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
				year:  yr,
				month: mo,
				day:   clamp(parseInt(m[3]!, 10), 1, maxDaysInMonth(mo, yr)),
			});
			return;
		}

		const m = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
		if (!m) return;
		const overrides: DateTimeParts = {
			year:    parseInt(m[1]!, 10),
			month:   clamp(parseInt(m[2]!, 10), 1, 12),
		};
		// Clamp day to actual max for the parsed month/year
		const parsedYear  = overrides.year;
		const parsedMonth = overrides.month;
		overrides.day     = clamp(parseInt(m[3]!, 10), 1, maxDaysInMonth(parsedMonth, parsedYear));
		overrides.hours   = m[4] ? Math.min(23, parseInt(m[4], 10)) : 0;
		overrides.minutes = m[5] ? Math.min(59, parseInt(m[5], 10)) : 0;
		if (withSeconds && m[6]) overrides.seconds = Math.min(59, parseInt(m[6], 10));
		emit(ev, overrides);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	class={cn(
		'flex h-full items-center gap-0 px-2 font-mono',
		disabled && 'cursor-not-allowed opacity-50',
		preset?.class,
		toClassValue(klass, bond)
	)}
	onpaste={handlePaste}
	{...restProps}
>
	<!-- Date: MM / DD / YYYY -->
	<Segment
		bind:this={segMonth}
		value={month}
		min={1} max={12} digits={2} placeholder="MM"
		{disabled} {readonly}
		onchange={(v) => { const o: DateTimeParts = {}; if (v !== undefined) o.month = v; emit(undefined, o); }}
		onfocusmove={(dir) => moveFocus(0, dir)}
		onrollover={(dir) => {
			// month rollover advances/retreats year
			const nextYear = (year ?? new Date().getFullYear()) + dir;
			const nextMonth = dir === 1 ? 1 : 12;
			emit(undefined, { year: nextYear, month: nextMonth });
		}}
	/>
	<span class="text-muted-foreground select-none">/</span>
	<Segment
		bind:this={segDay}
		value={day}
		min={1} max={maxDay} digits={2} placeholder="DD"
		{disabled} {readonly}
		onchange={(v) => { const o: DateTimeParts = {}; if (v !== undefined) o.day = v; emit(undefined, o); }}
		onfocusmove={(dir) => moveFocus(1, dir)}
		onrollover={(dir) => {
			// day rollover advances/retreats month (and year if needed)
			const curMonth = month ?? 1;
			const curYear  = year ?? new Date().getFullYear();
			let nextMonth = curMonth + dir;
			let nextYear  = curYear;
			if (nextMonth > 12) { nextMonth = 1; nextYear++; }
			if (nextMonth < 1)  { nextMonth = 12; nextYear--; }
			const nextDay = dir === 1 ? 1 : maxDaysInMonth(nextMonth, nextYear);
			emit(undefined, { year: nextYear, month: nextMonth, day: nextDay });
		}}
	/>
	<span class="text-muted-foreground select-none">/</span>
	<Segment
		bind:this={segYear}
		value={year}
		min={1} max={9999} digits={4} placeholder="YYYY"
		{disabled} {readonly}
		onchange={(v) => { const o: DateTimeParts = {}; if (v !== undefined) o.year = v; emit(undefined, o); }}
		onfocusmove={(dir) => moveFocus(2, dir)}
	/>

	{#if !isDateOnly}
		<span class="text-muted-foreground mx-1 select-none">·</span>
	{/if}

	<!-- Time: HH : MM [: SS] (datetime mode only) -->
	{#if !isDateOnly}
	<Segment
		bind:this={segHours}
		value={hours}
		min={0} max={23} digits={2} placeholder="HH"
		{disabled} {readonly}
		onchange={(v) => { const o: DateTimeParts = {}; if (v !== undefined) o.hours = v; emit(undefined, o); }}
		onfocusmove={(dir) => moveFocus(3, dir)}
		onrollover={(dir) => {
			// hours rollover advances/retreats day
			const curDay   = day ?? 1;
			const curMonth = month ?? 1;
			const curYear  = year ?? new Date().getFullYear();
			const curMax   = maxDaysInMonth(curMonth, curYear);
			let nextDay   = curDay + dir;
			let nextMonth = curMonth;
			let nextYear  = curYear;
			if (nextDay > curMax) { nextDay = 1; nextMonth++; }
			if (nextDay < 1)      { nextMonth--; nextDay = maxDaysInMonth(nextMonth < 1 ? 12 : nextMonth, curYear); }
			if (nextMonth > 12)   { nextMonth = 1; nextYear++; }
			if (nextMonth < 1)    { nextMonth = 12; nextYear--; }
			emit(undefined, { year: nextYear, month: nextMonth, day: nextDay, hours: dir === 1 ? 0 : 23 });
		}}
	/>
	<span class="text-muted-foreground select-none">:</span>
	<Segment
		bind:this={segMinutes}
		value={minutes}
		min={0} max={59} digits={2} placeholder="MM"
		{disabled} {readonly}
		onchange={(v) => { const o: DateTimeParts = {}; if (v !== undefined) o.minutes = v; emit(undefined, o); }}
		onfocusmove={(dir) => moveFocus(4, dir)}
		onrollover={(dir) => {
			// minutes rollover advances/retreats hours
			const nextHH = dir === 1
				? (hours !== undefined && hours >= 23 ? 0 : (hours ?? 0) + 1)
				: (hours !== undefined && hours <= 0  ? 23 : (hours ?? 23) - 1);
			const override: DateTimeParts = { minutes: dir === 1 ? 0 : 59, hours: nextHH };
			// if hours also wrap, advance day
			if ((dir === 1 && nextHH === 0) || (dir === -1 && nextHH === 23)) {
				const curDay   = day ?? 1;
				const curMonth = month ?? 1;
				const curYear  = year ?? new Date().getFullYear();
				const curMax   = maxDaysInMonth(curMonth, curYear);
				let nextDay   = curDay + dir;
				let nextMonth = curMonth;
				let nextYear  = curYear;
				if (nextDay > curMax) { nextDay = 1; nextMonth++; }
				if (nextDay < 1)      { nextMonth--; nextDay = maxDaysInMonth(nextMonth < 1 ? 12 : nextMonth, curYear); }
				if (nextMonth > 12)   { nextMonth = 1; nextYear++; }
				if (nextMonth < 1)    { nextMonth = 12; nextYear--; }
				override.day = nextDay; override.month = nextMonth; override.year = nextYear;
			}
			emit(undefined, override);
		}}
	/>
	{#if withSeconds}
		<span class="text-muted-foreground select-none">:</span>
		<Segment
			bind:this={segSeconds}
			value={seconds}
			min={0} max={59} digits={2} placeholder="SS"
			{disabled} {readonly}
			onchange={(v) => { const o: DateTimeParts = {}; if (v !== undefined) o.seconds = v; emit(undefined, o); }}
			onfocusmove={(dir) => moveFocus(5, dir)}
			onrollover={(dir) => {
				// seconds rollover advances/retreats minutes (batched)
				const nextMM = dir === 1
					? (minutes !== undefined && minutes >= 59 ? 0 : (minutes ?? 0) + 1)
					: (minutes !== undefined && minutes <= 0  ? 59 : (minutes ?? 59) - 1);
				const override: DateTimeParts = { seconds: dir === 1 ? 0 : 59, minutes: nextMM };
				// if minutes also wrap, advance hours
				if ((dir === 1 && nextMM === 0) || (dir === -1 && nextMM === 59)) {
					const nextHH = dir === 1
						? (hours !== undefined && hours >= 23 ? 0 : (hours ?? 0) + 1)
						: (hours !== undefined && hours <= 0  ? 23 : (hours ?? 23) - 1);
					override.hours = nextHH;
				}
				emit(undefined, override);
			}}
		/>
	{/if}
	{/if}
</span>
