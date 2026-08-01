<script lang="ts">
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import { Content } from '../popover/atoms';
	import {
		Root,
		Header as CalendarHeader,
		Body as CalendarBody,
		Day as CalendarDay
	} from '../calendar/atoms';
	import { DatePickerBond } from './bond.svelte';
	import DatePickerHeader from './date-picker-header.svelte';
	import DatePickerMonths from './date-picker-months.svelte';
	import DatePickerYears from './date-picker-years.svelte';
	import { HtmlAtom } from '../atom';
	import type { CalendarRange, Day as CalendarDayType } from '../calendar/types';
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

	function handleChange(_: CustomEvent, { range, pivote }: { range: CalendarRange; pivote: Date }) {
		if (!datePickerBond) return;

		datePickerBond.state.props.range = range;
		datePickerBond.state.props.pivote = pivote;
	}
</script>

<Content
	class={['relative overflow-hidden p-0 max-w-[96svw] md:max-w-xs', klass]}
	base={Root}
	onchange={handleChange}
	{...calendarProps}
>
	<HtmlAtom base={Header} class="col-span-full" />
	<HtmlAtom base={Weekdays} class="border-0" />

	<HtmlAtom base={Body}>
		{#snippet children({ day }: { day: CalendarDayType })}
			<Day {day} />
		{/snippet}
	</HtmlAtom>

	<HtmlAtom base={Months} />
	<HtmlAtom base={Years} />
</Content>
