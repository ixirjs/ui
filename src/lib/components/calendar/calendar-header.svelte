<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CalendarBond } from './bond.svelte';
	const PART = Kernel.part(CalendarBond, 'header', { class: '' });
</script>

<script lang="ts">
	import CalendarWeekDay from './calendar-week-day.svelte';

	let { class: klass = '', preset = undefined, ...restProps } = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const currentMonth = $derived(part.bond.props.currentMonth);

	const el = Kernel.element(part, () => ({
		class: ['calendar-header col-span-full grid h-fit grid-cols-subgrid', '$preset', klass],
		...restProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), body, undefined, el.motion(), el)}

{#snippet body()}
	{#each (currentMonth?.days ?? []).filter((d: NonNullable<typeof currentMonth>['days'][number]) => d.week == 1) as day, i (i)}
		<CalendarWeekDay index={i} isWeekend={day.weekend}>{day.name}</CalendarWeekDay>
	{/each}
{/snippet}
