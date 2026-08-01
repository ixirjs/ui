<script lang="ts">
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import { animate } from 'motion';
	import { getYear, setYear } from 'date-fns';
	import { cn } from '$svelte-atoms/core/utils';
	import { DatePickerBond } from './bond.svelte';
	import type { DatePickerYearsProps } from './types';
	import { HtmlAtom } from '../atom';
	import { Icon } from '../icon';

	const datePicker = DatePickerBond.getOrThrow(
		'<DatePicker.Years /> must be used within a <DatePicker.Root />'
	);

	const pivote = $derived(datePicker?.state.props.pivote ?? new Date());

	let pivoteYear = $derived(pivote.getFullYear());

	const currentYear = $derived(getYear(pivote));

	// 12-year grid: pivot −5 through pivot +6.
	const yearsGrid = $derived.by(() => {
		const years = [];
		const startYear = pivoteYear - 5;
		for (let i = 0; i < 12; i++) {
			years.push(startYear + i);
		}
		return years;
	});

	let { class: klass = '', preset = undefined, ...restProps }: DatePickerYearsProps = $props();

	const yearsProps = $derived(mergePresetProps(preset, 'datepicker.years', restProps));

	let scrollTimeout: NodeJS.Timeout | undefined = undefined;

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

	function handlePreviousYear() {
		pivoteYear = pivoteYear - 1;
	}

	function handleNextYear() {
		pivoteYear = pivoteYear + 1;
	}

	function handleYearSelect(year: number) {
		if (!datePicker?.state.props.pivote) return;
		const current = datePicker.state.props.pivote;
		datePicker.state.props.pivote = setYear(current, year);

		datePicker.closeYearsPicker();
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}

		// Debounce so rapid wheel deltas don't skip years.
		scrollTimeout = setTimeout(() => {
			const direction = event.deltaY > 0 ? 1 : -1; // scroll down = next year
			pivoteYear = pivoteYear + direction;
		}, 50);
	}
</script>

{#if datePicker.isYearsPickerOpen}
	<HtmlAtom
		class={['absolute inset-0 z-2 flex flex-col gap-2 bg-inherit opacity-0', '$preset', klass]}
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
		onwheel={handleWheel}
		{...yearsProps}
	>
		<HtmlAtom class="flex flex-1 flex-col" {enter} {exit}>
			<nav
				class="border-border text-foreground flex h-12 items-center justify-between gap-2 border-b px-2 py-2"
			>
				<button
					type="button"
					class="hover:bg-foreground/10 active:bg-foreground/20 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
					onclick={handlePreviousYear}
					aria-label="Previous year"
				>
					<Icon class="size-5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-full"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</Icon>
				</button>

				<div class="flex-1"></div>

				<button
					type="button"
					class="hover:bg-foreground/10 active:bg-foreground/20 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
					onclick={handleNextYear}
					aria-label="Next year"
				>
					<Icon class="size-5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-full"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M9 18l6-6-6-6" />
						</svg>
					</Icon>
				</button>
			</nav>

			<div class="grid flex-1 grid-cols-4 gap-1 px-2 py-2">
				{#each yearsGrid as year, i (i)}
					{@const isSelected = year === pivote.getFullYear()}
					{@const isCurrent = year === currentYear}
					<button
						type="button"
						class={cn(
							'hover:bg-foreground/10 active:bg-foreground/20 rounded-md px-3 py-2 text-sm transition-colors',
							isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
							isCurrent && !isSelected && 'ring-foreground/20 ring-1'
						)}
						onclick={() => handleYearSelect(year)}
						aria-label="Select year {year}"
						aria-current={isSelected ? 'date' : undefined}
					>
						{year}
					</button>
				{/each}
			</div>
		</HtmlAtom>
	</HtmlAtom>
{/if}
