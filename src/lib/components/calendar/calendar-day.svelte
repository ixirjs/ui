<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { isBefore, isSameDay, isWithinInterval } from '$ixirjs/ui/utils/date';
	import { cn } from '$ixirjs/ui/utils';
	import type { PresetLike } from '$ixirjs/ui/preset';
	import { CalendarBond } from './bond.svelte';
	import type { CalendarDayProps } from './types';

	const calendarBond = CalendarBond.get();

	const selectedDateStart = $derived(calendarBond?.props.start);
	const selectedDateEnd = $derived(calendarBond?.props.end);
	const isRange = $derived(calendarBond?.props.type === 'range');

	// `onclick` defaults to the part's own handler and a consumer's REPLACES it (never composes):
	// the week-picker story writes its own range on click and must not also select the day.
	let {
		day,
		as = 'button',
		children = undefined,
		onclick = handleClick,
		...restProps
	}: CalendarDayProps = $props();

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

	const el = Kernel.element(() => restProps, {
		preset: 'calendar.day',
		class:
			'calendar-day text-foreground/80 aspect-square cursor-pointer hover:bg-accent hover:text-accent-foreground',
		state: calendarBond,
		as: () => as,
		// DatePicker hands each day its `presets.day` layer as a prop.
		layer: () => (restProps as { presetLayer?: PresetLike }).presetLayer,
		attrs: () => ({
			// State modifiers, between the base and the preset — selected overrides, disabled fades.
			class: cn(
				day.weekend && 'text-primary',
				day.today && 'font-semibold z-1',
				day.offmonth && 'text-muted-foreground/50 bg-muted/50 hover:text-muted-foreground/70',
				isSelected && [
					'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-100',
					day.offmonth && 'bg-primary/80',
					day.weekend && 'bg-primary/90'
				],
				day.disabled && 'pointer-events-none opacity-25'
			),
			'data-disabled': day.disabled,
			'data-prec': day.fromPreviousMonth,
			'data-next': day.fromNextMonth,
			'data-offmonth': day.offmonth,
			'data-weekend': day.weekend,
			'data-today': day.today,
			'data-selected': isSelected,
			...(calendarBond
				? {
						id: calendarBond.dayId(day),
						role: 'gridcell',
						'aria-selected': calendarBond.isDaySelected(day),
						'aria-disabled': day.disabled,
						tabindex: day.disabled ? -1 : 0
					}
				: {}),
			onclick
		})
	});
	// Built once at init, never inside a tracked boundary (anchor-diet A3's constraint).
	const bodyArg = { calendar: calendarBond! };
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block, no
	// hydration anchor. `as` is why this part dispatches at all.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children ?? defaultDay, bodyArg)}

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
