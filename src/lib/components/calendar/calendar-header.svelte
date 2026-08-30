<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CalendarBond } from './bond.svelte';
	import CalendarWeekDay from './calendar-week-day.svelte';

	let { presetLayer = undefined, ...restProps } = $props();

	const bond = CalendarBond.getOrThrow(
		'<Calendar.Header /> must be used within a <Calendar.Root />'
	);
	const currentMonth = $derived(bond.props.currentMonth);

	const el = Kernel.element(() => restProps, {
		preset: 'calendar.header',
		class: 'calendar-header col-span-full grid h-fit grid-cols-subgrid',
		state: bond,
		// DatePicker hands this row its `presets.weekdays` layer as a prop.
		layer: () => presetLayer,
		attrs: () => ({ id: bond.headerId, role: 'row' })
	});
</script>

<div {...el.attrs}>
	{#each (currentMonth?.days ?? []).filter((d) => d.week == 1) as day, i (i)}
		<CalendarWeekDay index={i} isWeekend={day.weekend}>{day.name}</CalendarWeekDay>
	{/each}
</div>
