<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CalendarBond } from './bond.svelte';
	const PART = Kernel.plan(CalendarBond, 'body', { class: '' });
</script>

<script lang="ts">
	import CalendarDay from './calendar-day.svelte';
	import type { Day } from './types';

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

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
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

	const el = Kernel.element(part, () => ({
		class: ['col-span-full grid w-full grid-cols-subgrid', '$preset', klass],
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, body)}

{#snippet body()}
	{#each visibleDays as day (day.id)}
		{@render (!outsideDays && day.offmonth ? hiddenDay : children ? consumerDay : defaultDay)(day)}
	{/each}
{/snippet}

<!-- Declared outside the {#each}, so each takes the day it renders. -->
{#snippet hiddenDay()}
	<div aria-hidden="true"></div>
{/snippet}

{#snippet consumerDay(day: Day)}
	{@render children?.({ day })}
{/snippet}

{#snippet defaultDay(day: Day)}
	<CalendarDay {day} onclick={() => calendarBond?.selectStart(new Date(day.date))} />
{/snippet}
