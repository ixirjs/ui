<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { cn } from '$ixirjs/ui/utils';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { mergeAtomProps } from '$ixirjs/ui/components/atom';
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
		? createAtomInstance(
				untrack(() => `weekday-${index}`),
				{
					bond: calendarBond,
					factory: (owner) => owner!.weekDay(index)
				}
			)
		: undefined;

	const weekDayProps = $derived(mergeAtomProps(atom, preset ?? 'calendar.weekday', restProps));

	// `mergeAtomProps` already folded the Atom spread into the packet, so Kernel must not read it twice.
	const el = Kernel.element(
		{ atom: undefined, bond: calendarBond, preset: undefined, presetLayer: undefined },
		() => ({
			class: cn(
				'calendar-week-day h-fit px-1 py-2 text-center text-sm font-medium data-[weekend=true]:text-primary',
				klass
			),
			'data-weekend': isWeekend,
			...weekDayProps
		})
	);
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
