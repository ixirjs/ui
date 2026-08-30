<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { addMonths, format, isToday, startOfDay, subMonths } from '$ixirjs/ui/utils/date';
	import type { CalendarRange, CalendarRootProps, Day, Month } from './types';
	import { CalendarBond, CalendarContext } from './bond.svelte';

	import './calendar.css';

	const ID = $props.id();

	let {
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

	// Live props: the Bond reads through these getters, so a prop change is seen where it is read.
	const bondProps = {
		get id() {
			return ID;
		},
		get value() {
			return rangeState[0];
		},
		get range() {
			return rangeState;
		},
		get start() {
			return rangeState[0];
		},
		get end() {
			return rangeState[1];
		},
		get pivote() {
			return pivoteState;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get type() {
			return type ?? 'single';
		},
		get nextMonth() {
			return monthNext;
		},
		get currentMonth() {
			return monthCurrent;
		},
		get previousMonth() {
			return monthPrevious;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = CalendarContext.share(build ? build(bondProps) : CalendarBond.create(bondProps));
	// Controlled state: the Bond decides, the root writes, the callback fires after the write.
	bond.bindCommit({
		range(nextRange) {
			const previousRange = rangeState;
			const rangeChanged = !rangesEqual(previousRange, nextRange);
			const valueChanged = !Object.is(previousRange[0], nextRange[0]);

			rangeState = nextRange;
			valueState = rangeState[0];
			range = rangeState;
			value = valueState;
			start = rangeState[0];
			end = rangeState[1];

			if (type === 'range') {
				if (rangeChanged) onrangechange?.(rangeState, { bond });
			} else if (valueChanged) {
				onvaluechange?.(rangeState[0], { bond });
			}
		},
		pivote(next) {
			const changed = !Object.is(pivoteState, next);
			pivoteState = next;
			pivote = pivoteState;
			if (changed) onpivotechange?.(pivoteState, { bond });
		}
	});
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'calendar',
		class: 'h-fit w-full gap-px',
		state: bond,
		attrs: () => ({
			id: bond.rootId,
			role: 'application',
			'aria-label': 'Calendar',
			'aria-disabled': bond.props.disabled ?? false,
			'data-atom': 'calendar-root'
		})
	});
</script>

<div {...el.attrs}>{@render children?.({ calendar: bond })}</div>
