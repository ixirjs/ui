<script lang="ts">
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { Content } from '$ixirjs/ui/components/popover/atoms';
	import {
		Root,
		Header as CalendarHeader,
		Body as CalendarBody,
		Day as CalendarDay
	} from '$ixirjs/ui/components/calendar/atoms';
	import { DatePickerBond } from './bond.svelte';
	import DatePickerHeader from './date-picker-header.svelte';
	import DatePickerMonths from './date-picker-months.svelte';
	import DatePickerYears from './date-picker-years.svelte';
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
	import type { CalendarRange, Day as CalendarDayType } from '$ixirjs/ui/components/calendar/types';
	import type { DatePickerCalendarProps } from './types';

	const datePickerBond = DatePickerBond.get();

	let {
		class: klass = '',
		preset = undefined,
		header: Header = DatePickerHeader,
		weekdays: Weekdays = CalendarHeader,
		body: Body = CalendarBody,
		day: Day = CalendarDay,
		months: Months = DatePickerMonths,
		years: Years = DatePickerYears,
		...restProps
	}: DatePickerCalendarProps = $props();

	const calendarProps = $derived(mergePresetProps(preset, 'datepicker.calendar', restProps));
	const calendarLayer = $derived(datePickerBond?.presetLayer('calendar'));
	const headerLayer = $derived(datePickerBond?.presetLayer('header'));
	const weekdaysLayer = $derived(datePickerBond?.presetLayer('weekdays'));
	const bodyLayer = $derived(datePickerBond?.presetLayer('body'));
	const dayLayer = $derived(datePickerBond?.presetLayer('day'));
	const monthsLayer = $derived(datePickerBond?.presetLayer('months'));
	const yearsLayer = $derived(datePickerBond?.presetLayer('years'));

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
	base={Root}
	{...calendarProps}
	presetLayer={calendarLayer}
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
	<HtmlAtom base={Header} class="col-span-full" presetLayer={headerLayer} />
	<HtmlAtom base={Weekdays} class="border-0" presetLayer={weekdaysLayer} />

	<HtmlAtom base={Body} presetLayer={bodyLayer}>
		{#snippet children({ day }: { day: CalendarDayType })}
			<Day {day} presetLayer={dayLayer} />
		{/snippet}
	</HtmlAtom>

	<HtmlAtom base={Months} presetLayer={monthsLayer} />
	<HtmlAtom base={Years} presetLayer={yearsLayer} />
</Content>
