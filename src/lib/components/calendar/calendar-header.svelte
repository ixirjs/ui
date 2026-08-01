<script lang="ts">
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { CalendarBond } from './bond.svelte';
	import CalendarWeekDay from './calendar-week-day.svelte';
	import { usePart } from '$ixirjs/ui/shared';

	let { class: klass = '', preset = undefined, ...restProps } = $props();

	const part = usePart(CalendarBond, 'header', () => restProps, {
		preset: () => preset
	});
	const currentMonth = $derived(part.bond.props.currentMonth);

	const el = usePartElement(part, () => ({
		class: ['calendar-header col-span-full grid h-fit grid-cols-subgrid', '$preset', klass],
		...restProps
	}));
</script>

{#snippet body()}
	{#each (currentMonth?.days ?? []).filter((d: NonNullable<typeof currentMonth>['days'][number]) => d.week == 1) as day, i (i)}
		<CalendarWeekDay index={i} isWeekend={day.weekend}>{day.name}</CalendarWeekDay>
	{/each}
{/snippet}

{@render partElement(el, body)}
