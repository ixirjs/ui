<script lang="ts">
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import { HtmlAtom } from '../atom';
	import { DatePickerBond } from './bond.svelte';
	import { CalendarBond } from '../calendar/bond.svelte';
	import { Icon } from '../icon';
	import type { DatePickerHeaderProps } from './types';

	const datePickerBond = DatePickerBond.get();
	const calendarBond = CalendarBond.get();

	let {
		class: klass = '',
		preset = undefined,
		...restProps
	}: DatePickerHeaderProps = $props();

	const headerProps = $derived(mergePresetProps(preset, 'datepicker.header', restProps));

	const calendarBondProps = $derived(datePickerBond?.state?.props);

	const pivote = $derived(calendarBondProps?.pivote ?? new Date());

	const monthName = $derived(pivote.toLocaleDateString('en-US', { month: 'long' }));
	const year = $derived(pivote.getFullYear());

	function handlePreviousMonth() {
		calendarBond?.state?.previousMonth();
	}

	function handleNextMonth() {
		calendarBond?.state?.nextMonth();
	}

	function handleMonthPicker() {
		if (!datePickerBond) return;
		datePickerBond.state.openMonthsPicker();
	}
</script>

<HtmlAtom
	as="nav"
	class={['border-border flex items-center justify-between gap-2 border-b p-2', '$preset', klass]}
	{...headerProps}
>
	<button
		type="button"
		class="hover:bg-foreground/10 active:bg-foreground/20 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
		onclick={handlePreviousMonth}
		aria-label="Previous month"
	>
		<Icon class="size-5">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-full"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</Icon>
	</button>

	<button
		class="text-foreground h-full flex-1 cursor-pointer text-center text-sm font-semibold"
		onclick={handleMonthPicker}
	>
		{monthName}
		{year}
	</button>

	<button
		type="button"
		class="hover:bg-foreground/10 active:bg-foreground/20 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
		onclick={handleNextMonth}
		aria-label="Next month"
	>
		<Icon class="size-5">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-full"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M9 18l6-6-6-6" />
			</svg>
		</Icon>
	</button>
</HtmlAtom>
