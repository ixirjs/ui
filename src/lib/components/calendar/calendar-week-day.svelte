<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CalendarBond } from './bond.svelte';

	const bond = CalendarBond.get();

	let {
		isWeekend,
		index = 0,
		element = $bindable(undefined),
		children = undefined,
		...restProps
	} = $props();

	const el = Kernel.element(() => restProps, {
		preset: 'calendar.weekday',
		class:
			'calendar-week-day h-fit px-1 py-2 text-center text-sm font-medium data-[weekend=true]:text-primary',
		state: bond,
		attrs: () => ({
			'data-weekend': isWeekend,
			...(bond ? { id: bond.weekdayId(index), role: 'columnheader' } : {})
		})
	});
</script>

<div bind:this={element} {...el.attrs}>{@render children?.()}</div>
