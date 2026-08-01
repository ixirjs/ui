<script lang="ts">
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import { animate } from 'motion';
	import { getYear, getMonth, setMonth } from 'date-fns';
	import { cn } from '$svelte-atoms/core/utils';
	import { HtmlAtom } from '../atom';
	import { DatePickerBond } from './bond.svelte';
	import type { DatePickerMonthsProps } from './types';

	const datePicker = DatePickerBond.getOrThrow(
		'<DatePicker.Months /> must be used within a <DatePicker.Root />'
	);

	const pivote = $derived(datePicker?.state.props.pivote ?? new Date());

	const currentYear = $derived(getYear(pivote));
	const currentMonth = $derived(getMonth(pivote));

	const monthsGrid = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	let { class: klass = '', preset = undefined, ...restProps }: DatePickerMonthsProps = $props();

	const monthsProps = $derived(mergePresetProps(preset, 'datepicker.months', restProps));

	function enter(node: HTMLElement) {
		animate(
			node,
			{
				scale: [0.8, 1]
			},
			{ duration: 100 / 1000, ease: 'circOut' }
		);
		return {
			duration: 100
		};
	}

	function exit(node: HTMLElement) {
		animate(
			node,
			{
				scale: 0.8
			},
			{ duration: 100 / 1000, ease: 'circOut' }
		);
		return {
			duration: 100
		};
	}

	function handleMonthSelect(monthIndex: number) {
		if (!datePicker?.state.props.pivote) return;
		const current = datePicker.state.props.pivote;
		datePicker.state.props.pivote = setMonth(current, monthIndex);

		datePicker.closeMonthsPicker();
	}

	function handleYearPicker() {
		if (!datePicker) return;
		datePicker.openYearsPicker();
	}
</script>

{#if datePicker.isMonthsPickerOpen}
	<HtmlAtom
		class={['absolute inset-0 z-1 flex flex-col gap-2 bg-inherit opacity-0', '$preset', klass]}
		enter={(node) => {
			animate(
				node,
				{
					opacity: [0, 1]
				},
				{ duration: 100 / 1000, ease: 'anticipate' }
			);
			return {
				duration: 100
			};
		}}
		exit={(node) => {
			animate(
				node,
				{
					opacity: 0
				},
				{ duration: 100 / 1000, ease: 'anticipate' }
			);
			return {
				duration: 100
			};
		}}
		{...monthsProps}
	>
		<HtmlAtom class="flex flex-1 flex-col gap-2" {enter} {exit}>
			<nav
				class="border-border text-foreground flex h-12 items-center justify-center gap-2 border-b px-2 py-2"
			>
				<button
					class="text-foreground cursor-pointer text-center text-sm font-semibold"
					onclick={handleYearPicker}
				>
					{currentYear}
				</button>
			</nav>

			<div class="grid flex-1 grid-cols-3 gap-1 px-2 pb-2">
				{#each monthsGrid as month, index (index)}
					{@const isSelected = index === currentMonth}
					<button
						type="button"
						class={cn(
							'hover:bg-foreground/10 active:bg-foreground/20 rounded-md px-3 py-2 text-sm transition-colors',
							isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
						)}
						onclick={() => handleMonthSelect(index)}
						aria-label="Select {month}"
						aria-current={isSelected ? 'date' : undefined}
					>
						{month}
					</button>
				{/each}
			</div>
		</HtmlAtom>
	</HtmlAtom>
{/if}
