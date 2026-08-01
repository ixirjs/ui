<script lang="ts">
	import { resolveControlPreset } from '../shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import { untrack } from 'svelte';
	import { InputBond } from '../bond.svelte';
	import type {
		InputTimeControlProps,
		InputNumber24HourControlProps,
		InputNumber12HourControlProps
	} from '../types';
	import Segment from './segment.svelte';
	import {
		parseTimeString,
		buildTimeValue,
		clampTimeParts,
		mergeParts,
		displayToInternal,
		internalToDisplay,
		type TimeParts
	} from './shared';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
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
		...restProps
	}: InputTimeControlProps &
		(InputNumber24HourControlProps | InputNumber12HourControlProps) = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	// External value always wins over local edits.
	const parts = $derived(
		parseTimeString(
			value,
			untrack(() => date ?? undefined),
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

		// Sync bound date prop in place
		if (date && clamped.hh !== undefined && clamped.mm !== undefined) {
			// Local Date mutated before assignment; reactivity comes from `date = nd`, not in-place mutation.
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const nd = new Date(date);
			nd.setHours(clamped.hh, clamped.mm, withSeconds ? (clamped.ss ?? 0) : 0, 0);
			if (nd.getTime() !== date.getTime()) date = nd;
		}

		if (raw === value) return;

		value = raw;
		if (bond) bond.state.props.value = value;

		const detail = { value: raw };
		if (ev) onchange?.(ev, detail);
		else oninput?.(undefined as unknown as Event, detail);
	}

	// Convert display hours to internal 24h before emitting.
	function handleHoursChange(displayH: number | undefined) {
		if (displayH === undefined) {
			emit(undefined);
			return;
		}
		const internal = hourFormat === 12 ? displayToInternal(displayH, p ?? 'AM') : displayH;
		emit(undefined, { hh: internal });
	}

	function togglePeriod() {
		if (disabled || readonly || hh === undefined) return;
		const newPeriod = p === 'AM' ? 'PM' : 'AM';
		const newHH = displayToInternal(displayHours ?? 12, newPeriod);
		emit(undefined, { hh: newHH, period: newPeriod });
	}

	function handlePeriodKey(ev: KeyboardEvent) {
		const { key } = ev;
		if (key.toLowerCase() === 'a') {
			const newHH = displayToInternal(displayHours ?? 12, 'AM');
			emit(undefined, { hh: newHH, period: 'AM' });
		} else if (key.toLowerCase() === 'p') {
			const newHH = displayToInternal(displayHours ?? 12, 'PM');
			emit(undefined, { hh: newHH, period: 'PM' });
		} else if (['ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(key)) {
			ev.preventDefault();
			togglePeriod();
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
		disabled && 'cursor-not-allowed opacity-50',
		preset?.class,
		toClassValue(klass, bond)
	)}
	onpaste={handlePaste}
	{...restProps}
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
		onchange={handleHoursChange}
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
		onchange={(v) => {
			const o: TimeParts = {};
			if (v !== undefined) o.mm = v;
			emit(undefined, o);
		}}
		onfocusmove={(dir) => {
			if (dir === 1 && withSeconds) segSeconds?.focus();
			else if (dir === 1 && hourFormat === 12) {
				/* AM/PM is reached via Tab, not arrow */
			} else if (dir === -1) segHours?.focus();
		}}
		onrollover={(dir) => {
			if (displayHours === undefined) return;
			const maxH = hourFormat === 12 ? 12 : 23;
			const minH = hourFormat === 12 ? 1 : 0;
			const nextDisplayH =
				dir === 1
					? displayHours >= maxH
						? minH
						: displayHours + 1
					: displayHours <= minH
						? maxH
						: displayHours - 1;
			handleHoursChange(nextDisplayH);
		}}
	/>

	{#if withSeconds}
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
			onchange={(v) => {
				const o: TimeParts = {};
				if (v !== undefined) o.ss = v;
				emit(undefined, o);
			}}
			onfocusmove={(dir) => (dir === -1 ? segMinutes?.focus() : undefined)}
			onrollover={(dir) => {
				const nextMM =
					dir === 1
						? mm !== undefined && mm >= 59
							? 0
							: (mm ?? 0) + 1
						: mm !== undefined && mm <= 0
							? 59
							: (mm ?? 59) - 1;
				const wrapsHour = (dir === 1 && nextMM === 0) || (dir === -1 && nextMM === 59);
				const override: TimeParts = { mm: nextMM };
				if (wrapsHour && displayHours !== undefined) {
					const maxH = hourFormat === 12 ? 12 : 23;
					const minH = hourFormat === 12 ? 1 : 0;
					const nextDisplayH =
						dir === 1
							? displayHours >= maxH
								? minH
								: displayHours + 1
							: displayHours <= minH
								? maxH
								: displayHours - 1;
					override.hh =
						hourFormat === 12 ? displayToInternal(nextDisplayH, p ?? 'AM') : nextDisplayH;
				}
				emit(undefined, override);
			}}
		/>
	{/if}

	{#if hourFormat === 12}
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
				disabled && 'cursor-not-allowed opacity-50'
			)}
			onclick={togglePeriod}
			onkeydown={handlePeriodKey}
		>
			{p ?? '--'}
		</span>
	{/if}
</span>
