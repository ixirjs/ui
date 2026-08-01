<script lang="ts">
	import CalendarDay from './calendar-day.svelte';
	import { CalendarBond } from './bond.svelte';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';

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

	const part = usePart(CalendarBond, 'body', () => restProps, {
		preset: () => preset
	});
	const calendarBond = part.bond;
	const currentMonth = $derived(calendarBond.props.currentMonth);

	// Days to lay out: with outsideDays the full 6-week grid; otherwise drop any week
	// that is entirely off-month (the redundant all-next/prev-month row) while keeping
	// 7-day alignment intact. Boundary off-month days are kept here and rendered as
	// blank placeholders below so the columns stay put.
	const visibleDays = $derived.by(() => {
		type Day = NonNullable<typeof currentMonth>['days'][number];
		const days: Day[] = currentMonth?.days ?? [];
		if (outsideDays) return days;

		const weeks: Day[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		return weeks.filter((week) => week.some((day) => !day.offmonth)).flat();
	});

	const el = usePartElement(part, () => ({
		class: ['col-span-full grid w-full grid-cols-subgrid', '$preset', klass],
		...restProps
	}));
</script>

{#snippet body()}
	{#each visibleDays as day (day.id)}
		{#if !outsideDays && day.offmonth}
			<div aria-hidden="true"></div>
		{:else if children}
			{@render children?.({ day })}
		{:else}
			<CalendarDay
				{day}
				onclick={() => {
					calendarBond?.selectStart(new Date(day.date));
				}}
			/>
		{/if}
	{/each}
{/snippet}

{@render partElement(el, body)}
