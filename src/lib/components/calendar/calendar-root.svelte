<script lang="ts">
	import { addMonths, format, isToday, startOfDay, subMonths } from '$ixirjs/ui/utils/date';
	import type { CalendarRange, CalendarRootProps, Day, Month } from './types';
	import { CalendarBond } from './bond.svelte';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';

	import './calendar.css';
	import { useRoot } from '$ixirjs/ui/shared';
	import { untrack } from 'svelte';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		value = $bindable(),
		range = $bindable([undefined, undefined]),
		pivote = $bindable(new Date()),
		start = $bindable<Date | undefined>(startOfDay(new Date())),
		end = $bindable(),
		min = undefined,
		max = undefined,
		type = 'single',
		// swallowed: kept out of the props spread (not forwarded to the element)
		extend: _extend = {},
		onvaluechange = undefined,
		onrangechange = undefined,
		onpivotechange = undefined,
		factory = undefined,
		children = undefined,
		...restProps
	}: CalendarRootProps = $props();

	// `value` is the controlled source in single mode; seed it from the legacy range input once.
	let valueState = $derived(value);
	if (untrack(() => valueState) === undefined) valueState = untrack(() => range[0]);
	let rangeState = $derived<CalendarRange>(type === 'single' ? [valueState, undefined] : range);
	let pivoteState = $derived(pivote);
	const callbackState = { bond: undefined as CalendarBond | undefined };

	const monthCurrentDays = $derived(generator(pivoteState));

	const monthCurrent: Month = $derived.by(() => {
		const start = monthCurrentDays.at(0) as Day;
		const end = monthCurrentDays.at(-1) as Day;

		return {
			start: start?.date,
			end: end?.date,
			days: monthCurrentDays,
			name: start ? format(start.date, 'MM') : '',
			fullname: start ? format(start.date, 'MMM') : ''
		};
	});

	const monthPreviousDays = $derived(generator(subMonths(pivoteState, 1)));
	const monthPrevious: Month = $derived.by(() => {
		const start = monthPreviousDays.at(0) as Day;
		const end = monthPreviousDays.at(-1) as Day;

		return {
			start: start?.date,
			end: end?.date,
			days: monthPreviousDays,
			name: start ? format(start.date, 'MM') : '',
			fullname: start ? format(start.date, 'MMM') : ''
		};
	});

	const monthNextDays = $derived(generator(addMonths(pivoteState, 1)));

	const monthNext: Month = $derived.by(() => {
		const start = monthNextDays.at(0) as Day;
		const end = monthNextDays.at(-1) as Day;

		return {
			start: start?.date,
			end: end?.date,
			days: monthNextDays,
			name: start ? format(start.date, 'MM') : '',
			fullname: start ? format(start.date, 'MMM') : ''
		};
	});

	function generator(pivot: Date): Day[] {
		const firstDay = new Date(pivot.getFullYear(), pivot.getMonth(), 1).getDay();
		const lastMonthDaysCount = monthDays(pivot.getMonth() - 1, pivot.getFullYear());
		const sample = startOfDay(
			new Date(pivot.getFullYear(), pivot.getMonth() - 1, lastMonthDaysCount - firstDay)
		);

		const array: Day[] = [];

		for (let index = 0; index < 42; index++) {
			sample.setDate(sample.getDate() + 1);

			const prec =
				pivot.getMonth() > sample.getMonth() || pivot.getFullYear() > sample.getFullYear();
			const next =
				(pivot.getMonth() < sample.getMonth() && pivot.getFullYear() === sample.getFullYear()) ||
				(pivot.getMonth() > sample.getMonth() && pivot.getFullYear() < sample.getFullYear());

			const disabled =
				(min ? sample < startOfDay(min) : false) || (max ? sample > startOfDay(max) : false);

			array.push({
				id: sample.getTime(),
				date: new Date(sample),
				get offmonth() {
					return next || prec;
				},
				dayOfMonth: sample.getDate(),
				today: isToday(sample),
				week: Math.floor(index / 7),
				month: sample.getMonth(),
				disabled: disabled,
				weekend: sample.getDay() == 0,
				name: format(sample, 'iii'),
				fullname: format(sample, 'iiiii'),
				get fromNextMonth() {
					return next;
				},
				get fromPreviousMonth() {
					return prec;
				}
			});
		}

		return array;
	}

	function monthDays(month: number, year = 2020) {
		return new Date(year, month + 1, 0).getDate();
	}

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
		range = rangeState;
		value = valueState;
		start = rangeState[0];
		end = rangeState[1];

		const callbackBond = callbackState.bond;
		if (!callbackBond) return;
		if (type === 'range') {
			if (rangeChanged) onrangechange?.(rangeState, { bond: callbackBond });
		} else if (valueChanged) {
			onvaluechange?.(rangeState[0], { bond: callbackBond });
		}
	}

	const root = useRoot(
		CalendarBond,
		{
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
			end: [() => rangeState[1], (v: Date | undefined) => commitRange([rangeState[0], v])],
			min: [() => min, (v: Date | undefined) => (min = v)],
			max: [() => max, (v: Date | undefined) => (max = v)],
			type: () => type ?? 'single',
			nextMonth: () => monthNext,
			currentMonth: () => monthCurrent,
			previousMonth: () => monthPrevious
		},
		{
			preset: () => preset ?? 'calendar',
			id: () => ID,
			factory: () => factory,
			// The callback bond must be live before the root Atom's capabilities can fire a change.
			connect: (owner) => (callbackState.bond = owner)
		}
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['h-fit w-full gap-px', '$preset', klass],
		'data-atom': 'calendar-root',
		...restProps
	}));
</script>

{@render partElement(el, children, { calendar: bond })}
