<script lang="ts">
	import { cn } from '$svelte-atoms/core/utils';
	import { mergePresetProps, HtmlAtom } from '../atom';
	import { CalendarBond } from './bond.svelte';
	import CalendarWeekDay from './calendar-week-day.svelte';

	const calendarBond = CalendarBond.get();
	const currentMonth = $derived(calendarBond?.state.props.currentMonth);

	let { class: klass = '', preset = undefined, ...restProps } = $props();

	const headerProps = $derived(
		mergePresetProps(preset, 'calendar.header', { ...calendarBond?.header().spread, ...restProps })
	);
</script>

<HtmlAtom
	class={cn('calendar-header col-span-full grid h-fit grid-cols-subgrid', klass)}
	{...headerProps}
>
	{#each (currentMonth?.days ?? []).filter((d: NonNullable<typeof currentMonth>['days'][number]) => d.week == 1) as day, i (i)}
		<CalendarWeekDay index={i} isWeekend={day.weekend}>{day.name}</CalendarWeekDay>
	{/each}
</HtmlAtom>
