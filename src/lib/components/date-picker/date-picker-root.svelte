<script lang="ts">
	import type { CalendarRange } from '$ixirjs/ui/components/calendar/types';
	import { DatePickerBond } from './bond.svelte';
	import type { DatePickerRootProps } from './types';
	import { useRoot } from '$ixirjs/ui/shared';
	import { untrack } from 'svelte';

	const ID = $props.id();

	let {
		open = $bindable(false),
		value = $bindable<Date | undefined>(undefined),
		range = $bindable([undefined, undefined]),
		pivote = $bindable(new Date()),
		start = $bindable<Date | undefined>(undefined),
		end = $bindable<Date | undefined>(undefined),
		min = undefined,
		max = undefined,
		type = 'single',
		placement = 'bottom',
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		offset = 2,
		disabled = false,
		placeholder = 'Select a date',
		format = 'MM/dd/yyyy',
		presets = undefined,
		factory = undefined,
		children,
		onopenchange = undefined,
		onvaluechange = undefined,
		onrangechange = undefined,
		onpivotechange = undefined
	}: DatePickerRootProps = $props();

	let openState = $derived(open);
	let valueState = $derived(value);
	let startState = $derived(start);
	let endState = $derived(end);
	// Preserve tuple initialization while making value/start/end the controlled mode-specific inputs.
	if (untrack(() => valueState) === undefined) valueState = untrack(() => range[0]);
	if (untrack(() => startState) === undefined) startState = untrack(() => range[0]);
	if (untrack(() => endState) === undefined) endState = untrack(() => range[1]);
	let rangeState = $derived<CalendarRange>(
		type === 'single' ? [valueState, undefined] : [startState, endState]
	);
	let pivoteState = $derived(pivote);
	const callbackState = { bond: undefined as DatePickerBond | undefined };

	function rangesEqual(left: CalendarRange, right: CalendarRange) {
		return Object.is(left[0], right[0]) && Object.is(left[1], right[1]);
	}

	function commitRange(nextRange: CalendarRange) {
		const previousRange = rangeState;
		const previousValue = previousRange[0];
		const rangeChanged = !rangesEqual(previousRange, nextRange);
		const valueChanged = !Object.is(previousValue, nextRange[0]);

		rangeState = nextRange;
		valueState = rangeState[0];
		startState = rangeState[0];
		endState = rangeState[1];
		range = rangeState;
		value = valueState;
		start = startState;
		end = endState;

		const callbackBond = callbackState.bond;
		if (!callbackBond) return;
		if (type === 'range') {
			if (rangeChanged) onrangechange?.(rangeState, { bond: callbackBond });
		} else if (valueChanged) {
			onvaluechange?.(rangeState[0], { bond: callbackBond });
		}
	}

	const root = useRoot(
		DatePickerBond,
		{
			open: [
				() => openState,
				(v) => {
					const changed = !Object.is(openState, v);
					openState = v;
					open = openState;

					const callbackBond = callbackState.bond;
					if (changed && callbackBond) {
						onopenchange?.(openState, { bond: callbackBond });
					}
				}
			],
			range: [() => rangeState, commitRange],
			value: [() => rangeState[0], (v) => commitRange([v, rangeState[1]])],
			pivote: [
				() => pivoteState,
				(v) => {
					const changed = !Object.is(pivoteState, v);
					pivoteState = v as Date;
					pivote = pivoteState;

					const callbackBond = callbackState.bond;
					if (changed && callbackBond) {
						onpivotechange?.(pivoteState, { bond: callbackBond });
					}
				}
			],
			start: [() => rangeState[0], (v) => commitRange([v, rangeState[1]])],
			end: [() => rangeState[1], (v) => commitRange([rangeState[0], v])],
			min: [() => min, (v) => (min = v)],
			max: [() => max, (v) => (max = v)],
			type: () => type ?? 'single',
			// Positioning props — without these the bond's offset/placement stay undefined,
			// which makes popover-overlay's transform compute to NaN and the overlay renders
			// pinned at top-left instead of anchored to the trigger.
			placement: () => placement,
			placements: () => placements ?? [],
			offset: () => offset,
			disabled: () => disabled,
			placeholder: () => placeholder,
			format: () => format,
			presets: () => presets
		},
		{ atom: false, id: () => ID, factory: () => factory }
	);
	// useRoot publishes through the flat-composition share override, making this bond available
	// under both the date-picker and popover context keys.
	const bond = root.bond;
	callbackState.bond = bond;

	export const getBond = root.getBond;
</script>

{@render children?.({ datePicker: bond })}
