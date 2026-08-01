<script lang="ts">
	import { startOfDay } from 'date-fns';
	import type { CalendarRange } from '../calendar/types';
	import { DatePickerBond, DatePickerBondState } from './bond.svelte';
	import type { DatePickerRootProps } from './types';
	import { bondFactory,bindBond, useCapabilities } from '$svelte-atoms/core/shared';

	let {
		open = $bindable(false),
		value = $bindable(undefined),
		range = $bindable([undefined, undefined]),
		pivote = $bindable(new Date()),
		start = $bindable(startOfDay(new Date())),
		end = $bindable(undefined),
		min = undefined,
		max = undefined,
		type = 'single',
		placement = 'bottom',
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		offset = 2,
		factory = bondFactory(DatePickerBondState, DatePickerBond),
		children,
		...restProps
	}: DatePickerRootProps = $props();

	const binding = bindBond<DatePickerBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => (open = v)],
			range: [() => range, (v: CalendarRange) => (range = v)],
			value: [() => range?.[0], (v) => (range[0] = v)],
			pivote: [() => pivote, (v) => (pivote = v as Date)],
			start: [() => range[0], (v) => (range[0] = v)],
			end: [() => range[1], (v) => (range[1] = v)],
			min: [() => min, (v) => (min = v)],
			max: [() => max, (v) => (max = v)],
			type: () => type ?? 'single',
			// Positioning props — without these the bond's offset/placement stay undefined,
			// which makes popover-overlay's transform compute to NaN and the overlay renders
			// pinned at top-left instead of anchored to the trigger.
			placement: () => placement,
			placements: () => placements ?? [],
			offset: () => offset,
			// Vestigial: element-less context root, no typed channel to forward restProps.
			rest: () => restProps
		}
	);
	// `share()` publishes the bond under both the date-picker context key (read by
	// `DatePickerBond.get()` in the calendar/header/sub-pickers) and the popover key
	// (read by the re-exported `Trigger`/`Content`/`Arrow`/`Indicator`), via the
	// flat-composition `share` override. ADR 0004 Decision 1.
	const bond = binding.bond.share();

	// Run capability setups — focus capture/restore reacts to `open` via the focus capability's
	// setup() (ADR 0001 / ADR 0003, ADR 0010); the bond is shared directly here.
	useCapabilities(bond);
	// Topmost-open-overlay Escape coordination (ADR 0009 D1/D2).

</script>

{@render children?.({ datePicker: bond })}
