<script lang="ts">
	import CalendarDay from './calendar-day.svelte';
	import { CalendarBond } from './bond.svelte';
	import { cn } from '$svelte-atoms/core/utils';
	import { mergePresetProps, HtmlAtom } from '../atom';

	const calendarBond = CalendarBond.get();

	const currentMonth = $derived(calendarBond?.state.props.currentMonth);

	let {
		class: klass = '',
		weekday,
		preset = undefined,
		// When false, off-month padding days (trailing prev-month / leading next-month)
		// are not rendered as real days — fully-off-month weeks are dropped and the
		// remaining boundary off-month cells become inert placeholders. Use this for
		// multi-month / range views where those dates already appear in the adjacent panel.
		outsideDays = true,
		children = undefined,
		...restProps
	} = $props();

	// Days to lay out: with outsideDays the full 6-week grid; otherwise drop any week
	// that is entirely off-month (the redundant all-next/prev-month row) while keeping
	// 7-day alignment intact. Boundary off-month days are kept here and rendered as
	// blank placeholders below so the columns stay put.
	const visibleDays = $derived.by(() => {
		const days = currentMonth?.days ?? [];
		if (outsideDays) return days;

		const weeks = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		return weeks.filter((week) => week.some((day) => !day.offmonth)).flat();
	});

	const bodyProps = $derived(mergePresetProps(preset, 'calendar.body', { ...calendarBond?.body().spread, ...restProps }));
</script>

<HtmlAtom
	class={cn('col-span-full grid w-full grid-cols-subgrid', klass)}
	{...bodyProps}
>
	{#each visibleDays as day (day.id)}
		{#if !outsideDays && day.offmonth}
			<div aria-hidden="true"></div>
		{:else if children}
			{@render children?.({ day })}
		{:else}
			<CalendarDay
				{day}
				onclick={() => {
					calendarBond?.state.selectStart(new Date(day.date));
				}}
			/>
		{/if}
	{/each}
</HtmlAtom>
