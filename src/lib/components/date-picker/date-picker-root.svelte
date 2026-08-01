<script lang="ts">
	import { startOfDay } from 'date-fns';
	import type { CalendarRange } from '../calendar/types';
	import { DatePickerBond, type DatePickerBondProps } from './bond.svelte';
	import type { DatePickerRootProps } from './types';
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';

	let {
		open = $bindable(false),
		value = $bindable<Date | undefined>(undefined),
		range = $bindable([undefined, undefined]),
		pivote = $bindable(new Date()),
		start = $bindable<Date | undefined>(startOfDay(new Date())),
		end = $bindable<Date | undefined>(undefined),
		min = undefined,
		max = undefined,
		type = 'single',
		placement = 'bottom',
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		offset = 2,
		factory = (props: DatePickerBondProps) => DatePickerBond.create(props),
		children,
		...restProps
	}: DatePickerRootProps = $props();

	let openState = $derived(open);
	let rangeState = $derived<CalendarRange>(range);
	let pivoteState = $derived(pivote);

	const binding = bindBond<DatePickerBond>((props) => factory(props), {
		open: [
			() => openState,
			(v) => {
				openState = v;
				open = openState;
			}
		],
		range: [
			() => rangeState,
			(v: CalendarRange) => {
				rangeState = v;
				range = rangeState;
				value = rangeState[0];
				start = rangeState[0];
				end = rangeState[1];
			}
		],
		value: [
			() => rangeState?.[0],
			(v) => {
				rangeState = [v, rangeState[1]];
				range = rangeState;
				value = v;
				start = v;
			}
		],
		pivote: [
			() => pivoteState,
			(v) => {
				pivoteState = v as Date;
				pivote = pivoteState;
			}
		],
		start: [
			() => rangeState[0],
			(v) => {
				rangeState = [v, rangeState[1]];
				range = rangeState;
				start = v;
				value = v;
			}
		],
		end: [
			() => rangeState[1],
			(v) => {
				rangeState = [rangeState[0], v];
				range = rangeState;
				end = v;
			}
		],
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
	});
	// `share()` publishes the bond under both the date-picker context key (read by
	// `DatePickerBond.get()` in the calendar/header/sub-pickers) and the popover key
	// (read by the re-exported `Trigger`/`Content`/`Arrow`/`Indicator`), via the
	// flat-composition `share` override.
	const bond = binding.bond.share();

	// Activate the bond's capability setups: the focus capability captures activeElement on
	// open and restores it on close, and the escape capability enrolls this overlay in the
	// topmost-open-overlay stack so only the frontmost surface acts on Escape.
	useCapabilities(bond);
</script>

{@render children?.({ datePicker: bond })}
