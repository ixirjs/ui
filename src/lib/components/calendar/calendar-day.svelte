<script lang="ts">
	import { isBefore, isSameDay, isWithinInterval } from 'date-fns';
	import { cn } from '$svelte-atoms/core/utils';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { CalendarBond } from './bond.svelte';
	import type { CalendarDayProps } from './types';
	import { mergePresetProps, HtmlAtom } from '../atom';
	import { untrack } from 'svelte';

	const calendarBond = CalendarBond.get();

	const selectedDateStart = $derived(calendarBond?.state.props.start);
	const selectedDateEnd = $derived(calendarBond?.state.props.end);
	const isRange = $derived(calendarBond?.state.props.type === 'range');

	let {
		class: klass = '',
		preset = undefined,
		day,
		as = 'button',
		children = undefined,
		onclick = handleClick,
		...restProps
	}: CalendarDayProps = $props();
	const atom = calendarBond
		? createAtomInstance(() => `day-${day.id}`, {
				bond: calendarBond,
				factory: (owner) => owner!.day(day),
				register: { key: untrack(() => `day-${day.id}`) }
			})
		: undefined;

	const dayProps = $derived(
		mergePresetProps(preset, 'calendar.day', { ...atom?.spread, ...restProps })
	);

	const isSelected = $derived.by(() => {
		if (selectedDateEnd && selectedDateStart) {
			return isWithinInterval(day.date, { end: selectedDateEnd, start: selectedDateStart });
		}

		return !!(selectedDateStart && isSameDay(day.date, selectedDateStart));
	});

	function handleClick() {
		if (day.disabled) return;

		if (isRange) {
			const start = calendarBond?.state.props.start;
			if (!start) {
				calendarBond?.selectStart(new Date(day.date));
				return;
			}

			if (isBefore(new Date(day.date), new Date(start))) {
				calendarBond?.selectStart(new Date(day.date));
				return;
			}

			calendarBond?.selectEnd(new Date(day.date));
		} else {
			calendarBond?.selectStart(new Date(day.date));
		}
	}
</script>

<HtmlAtom
	{as}
	class={[
		'calendar-day text-foreground/80 aspect-square cursor-pointer',
		'hover:bg-accent hover:text-accent-foreground',
		// State modifiers
		day.weekend && 'text-primary',
		day.today && 'font-semibold z-1',
		day.offmonth && 'text-muted-foreground/50 bg-muted/50 hover:text-muted-foreground/70',
		// Selected state (overrides above)
		isSelected && [
			'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-100',
			day.offmonth && 'bg-primary/80',
			day.weekend && 'bg-primary/90'
		],
		// Disabled state (applies opacity on top)
		day.disabled && 'pointer-events-none opacity-25',
		klass
	]}
	data-disabled={day.disabled}
	data-prec={day.fromPreviousMonth}
	data-next={day.fromNextMonth}
	data-offmonth={day.offmonth}
	data-weekend={day.weekend}
	data-today={day.today}
	data-selected={isSelected}
	{onclick}
	{...dayProps}
>
	{#if children}
		{@render children({
			calendar: calendarBond!
		})}
	{:else}
		<div
			class={cn(
				'value flex items-center justify-center size-full transition-colors duration-100',
				day.today && ['outline-primary outline-2', isSelected && 'outline-offset-3']
			)}
		>
			<span>{day.dayOfMonth}</span>
		</div>
	{/if}
</HtmlAtom>
