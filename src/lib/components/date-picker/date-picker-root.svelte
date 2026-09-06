<script lang="ts">
	import { PopupBond } from '$ixirjs/ui/components/overlay/popup/bond.svelte';
	import { untrack } from 'svelte';
	import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
	import { useOutsidePress, usePositioned } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import {
		PopoverContext,
		type PopoverBond,
		type PopoverBondBase
	} from '$ixirjs/ui/components/popover/bond.svelte';
	import type { CalendarRange } from '$ixirjs/ui/components/calendar/types';
	import { DatePickerContext, type DatePickerBondProps } from './bond.svelte';
	import type { DatePickerRootProps } from './types';

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

		if (type === 'range') {
			if (rangeChanged) onrangechange?.(rangeState, { bond });
		} else if (valueChanged) {
			onvaluechange?.(rangeState[0], { bond });
		}
	}

	function commitPivote(next: Date) {
		const changed = !Object.is(pivoteState, next);
		pivoteState = next;
		pivote = pivoteState;
		if (changed) onpivotechange?.(pivoteState, { bond });
	}

	// Live props: an object of accessors the Bond, the Calendar and the sub-pickers read and write
	// through. Every write lands on the same commit the root's bindables and callbacks share.
	const bondProps: DatePickerBondProps = {
		get id() {
			return ID;
		},
		get open() {
			return openState;
		},
		set open(next: boolean | undefined) {
			openState = next ?? false;
			open = openState;
		},
		get value() {
			return rangeState[0];
		},
		set value(next: Date | undefined) {
			commitRange([next, rangeState[1]]);
		},
		get range() {
			return rangeState;
		},
		set range(next: CalendarRange) {
			commitRange(next);
		},
		get start() {
			return rangeState[0];
		},
		set start(next: Date | undefined) {
			commitRange([next, rangeState[1]]);
		},
		get end() {
			return rangeState[1];
		},
		set end(next: Date | undefined) {
			commitRange([rangeState[0], next]);
		},
		get pivote() {
			return pivoteState;
		},
		set pivote(next: Date | undefined) {
			if (next) commitPivote(next);
		},
		get min() {
			return min;
		},
		set min(next: Date | undefined) {
			min = next;
		},
		get max() {
			return max;
		},
		set max(next: Date | undefined) {
			max = next;
		},
		get type() {
			return type ?? 'single';
		},
		get disabled() {
			return disabled;
		},
		get placeholder() {
			return placeholder;
		},
		get format() {
			return format;
		},
		// Positioning props — without these the bond's offset/placement stay undefined, which makes
		// popover-overlay's transform compute to NaN and the overlay renders pinned at top-left
		// instead of anchored to the trigger.
		get placement() {
			return placement;
		},
		get placements() {
			return placements ?? [];
		},
		get offset() {
			return offset;
		},
		get position() {
			return 'absolute' as const;
		},
		get presets() {
			return presets;
		}
	};
	const bond = DatePickerContext.share(PopupBond.mount('date-picker', bondProps));
	// Shared under Popover's and the overlay host's keys too: `DatePicker.Tail`/`DatePicker.Indicator`
	// ARE the Popover parts, and a nested popover gates its own open state on the host.
	PopoverContext.share(bond as unknown as PopoverBond);
	OverlayContext.share(bond);
	// Controlled state: the Bond decides, the root writes, the callback fires after the write with
	// the staged `event`/`reason` a dismissal handed it.
	bond.bindCommit((next, context) => {
		openState = next;
		open = openState;
		onopenchange?.(next, context);
	});
	usePositioned(bond);
	useOutsidePress(bond, {
		event: 'click',
		onDismiss: (event, o) => (o as PopoverBondBase).onclickoutside?.(event, o as PopoverBondBase)
	});

	export const getBond = () => bond;
</script>

{@render children?.({ datePicker: bond })}
