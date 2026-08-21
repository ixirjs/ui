<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { isBefore, isSameDay, isWithinInterval } from '$ixirjs/ui/utils/date';
	import { cn } from '$ixirjs/ui/utils';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { CalendarBond } from './bond.svelte';
	import type { CalendarDayProps } from './types';
	import { mergeAtomProps } from '$ixirjs/ui/components/atom';
	import { untrack } from 'svelte';

	const calendarBond = CalendarBond.get();

	const selectedDateStart = $derived(calendarBond?.props.start);
	const selectedDateEnd = $derived(calendarBond?.props.end);
	const isRange = $derived(calendarBond?.props.type === 'range');

	let {
		class: klass = '',
		preset = undefined,
		day,
		as = 'button',
		children = undefined,
		onclick = handleClick,
		...restProps
	}: CalendarDayProps = $props();
	const atom = calendarBond
		? createAtomInstance(
				untrack(() => `day-${day.id}`),
				{
					bond: calendarBond,
					factory: (owner) => owner!.day(day)
				}
			)
		: undefined;

	const dayProps = $derived(mergeAtomProps(atom, preset ?? 'calendar.day', restProps));

	const isSelected = $derived.by(() => {
		if (selectedDateEnd && selectedDateStart) {
			return isWithinInterval(day.date, { end: selectedDateEnd, start: selectedDateStart });
		}

		return !!(selectedDateStart && isSameDay(day.date, selectedDateStart));
	});

	function handleClick() {
		if (day.disabled) return;

		if (isRange) {
			const start = calendarBond?.props.start;
			if (!start) {
				calendarBond?.selectStart(new Date(day.date));
				return;
			}

			if (isBefore(new Date(day.date), new Date(start))) {
				calendarBond?.selectStart(new Date(day.date));
				return;
			}

			calendarBond?.selectEnd(new Date(day.date));
		} else {
			calendarBond?.selectStart(new Date(day.date));
		}
	}

	// `mergeAtomProps` already folded the Atom spread into the packet, so Kernel must not read it twice.
	const el = Kernel.element(
		{ atom: undefined, bond: calendarBond, preset: undefined, presetLayer: undefined },
		() => ({
			as,
			class: [
				'calendar-day text-foreground/80 aspect-square cursor-pointer',
				'hover:bg-accent hover:text-accent-foreground',
				// State modifiers
				day.weekend && 'text-primary',
				day.today && 'font-semibold z-1',
				day.offmonth && 'text-muted-foreground/50 bg-muted/50 hover:text-muted-foreground/70',
				// Selected state (overrides above)
				isSelected && [
					'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-100',
					day.offmonth && 'bg-primary/80',
					day.weekend && 'bg-primary/90'
				],
				// Disabled state (applies opacity on top)
				day.disabled && 'pointer-events-none opacity-25',
				klass
			],
			'data-disabled': day.disabled,
			'data-prec': day.fromPreviousMonth,
			'data-next': day.fromNextMonth,
			'data-offmonth': day.offmonth,
			'data-weekend': day.weekend,
			'data-today': day.today,
			'data-selected': isSelected,
			onclick,
			...dayProps
		})
	);
	// Built once at init, never inside a tracked boundary (anchor-diet A3's constraint).
	const bodyArg = { calendar: calendarBond! };
</script>

{@render Kernel.render(el)(el, children ?? defaultDay, bodyArg)}

{#snippet defaultDay()}
	<div
		class={cn(
			'value flex items-center justify-center size-full transition-colors duration-100',
			day.today && ['outline-primary outline-2', isSelected && 'outline-offset-3']
		)}
	>
		<span>{day.dayOfMonth}</span>
	</div>
{/snippet}
