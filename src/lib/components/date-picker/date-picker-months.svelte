<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { animate } from '$ixirjs/ui/shared';
	import { getYear, getMonth, setMonth } from '$ixirjs/ui/utils/date';
	import { cn } from '$ixirjs/ui/utils';
	import { DatePickerBond } from './bond.svelte';
	import type { DatePickerMonthsProps } from './types';

	const datePicker = DatePickerBond.getOrThrow(
		'<DatePicker.Months /> must be used within a <DatePicker.Root />'
	);

	const pivote = $derived(datePicker?.props.pivote ?? new Date());

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
		if (!datePicker?.props.pivote) return;
		const current = datePicker.props.pivote;
		datePicker.props.pivote = setMonth(current, monthIndex);

		datePicker.closeMonthsPicker();
	}

	function handleYearPicker() {
		if (!datePicker) return;
		datePicker.openYearsPicker();
	}
	// The picker's own fade, hoisted out of the markup: the inline arrows rebuilt a closure pair on
	// every render of an overlay whose animation never varies.
	function fadeIn(node: HTMLElement) {
		animate(node, { opacity: [0, 1] }, { duration: 100 / 1000, ease: 'anticipate' });
		return { duration: 100 };
	}

	function fadeOut(node: HTMLElement) {
		animate(node, { opacity: 0 }, { duration: 100 / 1000, ease: 'anticipate' });
		return { duration: 100 };
	}

	// Element seams instead of component boundaries. Declared here, not in the snippet: the seam owns
	// effects and must be created during init, and a snippet body is not init.
	const overlayEl = Kernel.element(Kernel.static, () => ({
		class: ['absolute inset-0 z-1 flex flex-col gap-2 bg-inherit opacity-0', '$preset', klass],
		enter: fadeIn,
		exit: fadeOut,
		...monthsProps
	}));

	const panelEl = Kernel.element(Kernel.static, () => ({
		class: 'flex flex-1 flex-col gap-2',
		enter,
		exit
	}));
</script>

{@render (datePicker.isMonthsPickerOpen ? monthsPicker : undefined)?.()}

{#snippet monthsPicker()}
	{@render Kernel.render(overlayEl)(overlayEl, monthsOverlay)}
{/snippet}

{#snippet monthsOverlay()}
	{@render Kernel.render(panelEl)(panelEl, monthsPanel)}
{/snippet}

{#snippet monthsPanel()}
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
{/snippet}
