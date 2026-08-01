<script lang="ts">
	import { cn } from '$svelte-atoms/core/utils';
	import { addMonths, format, isToday, startOfDay, subMonths } from 'date-fns';
	import type { CalendarRange, CalendarRootProps, Day, Month } from './types';
	import { CalendarBond, CalendarBondState } from './bond.svelte';
	import { mergePresetProps, HtmlAtom } from '../atom';

	import './calendar.css';
	import { bondFactory,bindBond } from '$svelte-atoms/core/shared';

	let {
		class: klass = '',
		preset = undefined,
		value = $bindable(),
		range = $bindable([undefined, undefined]),
		pivote = $bindable(new Date()),
		start = $bindable(startOfDay(new Date())),
		end = $bindable(),
		min = undefined,
		max = undefined,
		type = 'single',
		extend = {},
		onchange = undefined,
		factory = bondFactory(CalendarBondState, CalendarBond),
		children = undefined,
		...restProps
	}: CalendarRootProps = $props();

	const monthCurrentDays = $derived(generator(pivote));

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

	const monthPreviousDays = $derived(generator(subMonths(pivote, 1)));
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

	const monthNextDays = $derived(generator(addMonths(pivote, 1)));

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

	const binding = bindBond<CalendarBond>(
		(props) => factory(props),
		{
			range: [
				() => range,
				(v: CalendarRange) => {
					range = v;
					onchange?.(new CustomEvent('change'), { range, pivote });
				}
			],
			value: [
				() => range?.[0],
				(v) => {
					if (range?.[0]) {
						range[0] = v;
					}
					onchange?.(new CustomEvent('change'), { range, pivote });
				}
			],
			pivote: [
				() => pivote,
				(v) => {
					pivote = v as Date;
					onchange?.(new CustomEvent('change'), { range, pivote });
				}
			],
			start: [
				() => range?.[0],
				(v) => {
					range[0] = v;
					onchange?.(new CustomEvent('change'), { range, pivote });
				}
			],
			end: [
				() => range?.[1],
				(v: Date | undefined) => {
					range[1] = v;
					onchange?.(new CustomEvent('change'), { range, pivote });
				}
			],
			min: [
				() => min,
				(v: Date | undefined) => (min = v)
			],
			max: [
				() => max,
				(v: Date | undefined) => (max = v)
			],
			type: () => type ?? 'single',
			nextMonth: () => monthNext,
			currentMonth: () => monthCurrent,
			previousMonth: () => monthPrevious
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	const rootProps = $derived(mergePresetProps(preset, 'calendar', { ...bond.root().spread, ...restProps }));


	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={cn('h-fit w-full gap-px', klass)} data-atom="calendar-root" {...rootProps}>
	{@render children?.({ calendar: bond })}
</HtmlAtom>
