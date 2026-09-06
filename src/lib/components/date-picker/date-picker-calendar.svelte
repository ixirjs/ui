<script lang="ts">
	import Content from '$ixirjs/ui/components/popover/popover-content.svelte';
	import {
		Root as CalendarRoot,
		Header as CalendarHeader,
		Body as CalendarBody,
		Day as CalendarDay
	} from '$ixirjs/ui/components/calendar/atoms';
	import { DatePickerContext } from './bond.svelte';
	import DatePickerHeader from './date-picker-header.svelte';
	import DatePickerMonths from './date-picker-months.svelte';
	import DatePickerYears from './date-picker-years.svelte';
	import type { CalendarRange, Day as CalendarDayType } from '$ixirjs/ui/components/calendar/types';
	import type { DatePickerCalendarProps } from './types';

	const datePickerBond = DatePickerContext.get();

	let {
		class: klass = '',
		preset = undefined,
		header: Header = DatePickerHeader,
		weekdays: Weekdays = CalendarHeader,
		body: Body = CalendarBody,
		day: Day = CalendarDay,
		months: Months = DatePickerMonths,
		years: Years = DatePickerYears,
		// swallowed: the calendar composes its own parts, so a consumer body never reached the panel
		// (the fragment below always won over the spread). Kept off the spread rather than typed away.
		children: _children = undefined,
		...restProps
	}: DatePickerCalendarProps = $props();

	// The calendar IS the popover content: `Popover.Content` renders `Calendar.Root` as its element
	// (`base`), so the panel and the calendar are one element, as they always were. `role="dialog"`
	// and the label are what `DatePickerContentAtom` projected; a consumer attribute wins over the
	// part's own, so they override Calendar.Root's `application`/`Calendar`.
	const calendarLayer = $derived(datePickerBond?.props.presets?.calendar);
	const headerLayer = $derived(datePickerBond?.props.presets?.header);
	const weekdaysLayer = $derived(datePickerBond?.props.presets?.weekdays);
	const bodyLayer = $derived(datePickerBond?.props.presets?.body);
	const dayLayer = $derived(datePickerBond?.props.presets?.day);
	const monthsLayer = $derived(datePickerBond?.props.presets?.months);
	const yearsLayer = $derived(datePickerBond?.props.presets?.years);

	function handleValueChange(value: Date | undefined) {
		if (datePickerBond) datePickerBond.props.value = value;
	}

	function handleRangeChange(range: CalendarRange) {
		if (datePickerBond) datePickerBond.props.range = range;
	}

	function handlePivoteChange(pivote: Date) {
		if (datePickerBond) datePickerBond.props.pivote = pivote;
	}
</script>

<Content
	class={['relative overflow-hidden p-0 max-w-[96svw] md:max-w-xs', klass]}
	base={CalendarRoot}
	preset={preset ?? 'datepicker.calendar'}
	{...restProps}
	presetLayer={calendarLayer}
	role="dialog"
	aria-label="Choose date"
	value={datePickerBond?.props.value}
	range={datePickerBond?.props.range ?? [undefined, undefined]}
	pivote={datePickerBond?.props.pivote ?? new Date()}
	start={datePickerBond?.props.start}
	end={datePickerBond?.props.end}
	min={datePickerBond?.props.min}
	max={datePickerBond?.props.max}
	type={datePickerBond?.props.type ?? 'single'}
	onvaluechange={handleValueChange}
	onrangechange={handleRangeChange}
	onpivotechange={handlePivoteChange}
>
	<Header class="col-span-full" presetLayer={headerLayer} />
	<Weekdays class="border-0" presetLayer={weekdaysLayer} />
	<Body presetLayer={bodyLayer} children={dayBody} />
	<Months presetLayer={monthsLayer} />
	<Years presetLayer={yearsLayer} />
</Content>

{#snippet dayBody({ day }: { day: CalendarDayType })}
	<Day {day} presetLayer={dayLayer} />
{/snippet}
