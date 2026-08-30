<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CalendarBond } from './bond.svelte';
	import CalendarDay from './calendar-day.svelte';
	import type { Day } from './types';

	let {
		weekday,
		// When false, off-month padding days (trailing prev-month / leading next-month)
		// are not rendered as real days — fully-off-month weeks are dropped and the
		// remaining boundary off-month cells become inert placeholders. Use this for
		// multi-month / range views where those dates already appear in the adjacent panel.
		outsideDays = true,
		// DatePicker hands this grid its `presets.body` layer as a prop.
		presetLayer = undefined,
		children = undefined,
		...restProps
	} = $props();

	const calendarBond = CalendarBond.getOrThrow(
		'<Calendar.Body /> must be used within a <Calendar.Root />'
	);
	const currentMonth = $derived(calendarBond.props.currentMonth);

	// Days to lay out: with outsideDays the full 6-week grid; otherwise drop any week
	// that is entirely off-month (the redundant all-next/prev-month row) while keeping
	// 7-day alignment intact. Boundary off-month days are kept here and rendered as
	// blank placeholders below so the columns stay put.
	const visibleDays = $derived.by(() => {
		const days: Day[] = currentMonth?.days ?? [];
		if (outsideDays) return days;

		const weeks: Day[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		return weeks.filter((week) => week.some((day) => !day.offmonth)).flat();
	});

	// The grid is named with `aria-label` rather than `aria-labelledby`: it used to reference a
	// `calendar-month-label-*` element this family never rendered, so it had no accessible name.
	const el = Kernel.element(() => restProps, {
		preset: 'calendar.body',
		class: 'col-span-full grid w-full grid-cols-subgrid',
		state: calendarBond,
		layer: () => presetLayer,
		attrs: () => {
			const month = calendarBond.props.currentMonth;
			return {
				id: calendarBond.bodyId,
				role: 'grid',
				...(month?.fullname ? { 'aria-label': month.fullname } : {})
			};
		}
	});
</script>

<div {...el.attrs}>
	{#each visibleDays as day (day.id)}
		{@render (!outsideDays && day.offmonth ? hiddenDay : children ? consumerDay : defaultDay)(day)}
	{/each}
</div>

<!-- Declared outside the {#each}, so each takes the day it renders. -->
{#snippet hiddenDay()}
	<div aria-hidden="true"></div>
{/snippet}

{#snippet consumerDay(day: Day)}
	{@render children?.({ day })}
{/snippet}

{#snippet defaultDay(day: Day)}
	<CalendarDay {day} onclick={() => calendarBond.selectStart(new Date(day.date))} />
{/snippet}
