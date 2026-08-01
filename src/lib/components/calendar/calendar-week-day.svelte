<script lang="ts">
	import { cn } from '$ixirjs/ui/utils';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { mergeAtomProps, HtmlAtom } from '$ixirjs/ui/components/atom';
	import { CalendarBond } from './bond.svelte';
	import { untrack } from 'svelte';

	const calendarBond = CalendarBond.get();

	let {
		class: klass = '',
		preset = undefined,
		isWeekend,
		index = 0,
		element = $bindable(undefined),
		children = undefined,
		...restProps
	} = $props();
	const atom = calendarBond
		? createAtomInstance(undefined, {
				resolveKey: () => `weekday-${index}`,
				bond: calendarBond,
				factory: (owner) => owner!.weekDay(index),
				register: { key: untrack(() => `weekday-${index}`) }
			})
		: undefined;

	const weekDayProps = $derived(mergeAtomProps(atom, preset ?? 'calendar.weekday', restProps));
</script>

<HtmlAtom
	class={cn(
		'calendar-week-day h-fit px-1 py-2 text-center text-sm font-medium data-[weekend=true]:text-primary',
		klass
	)}
	data-weekend={isWeekend}
	{...weekDayProps}
>
	{@render children?.()}
</HtmlAtom>
