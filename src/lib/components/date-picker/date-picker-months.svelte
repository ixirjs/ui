<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { animate } from '$ixirjs/ui/authoring';
	import { getYear, getMonth, setMonth } from '$ixirjs/ui/utils/date';
	import { cn } from '$ixirjs/ui/utils';
	import { DatePickerContext } from './bond.svelte';
	import type { DatePickerMonthsProps } from './types';

	const datePicker = DatePickerContext.getOrThrow(
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

	let {
		as = undefined,
		base = undefined,
		presetLayer = undefined,
		...restProps
	}: DatePickerMonthsProps = $props();

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

	// The inner panel carries no consumer props of its own.
	const EMPTY_PROPS = {};

	// Element seams instead of component boundaries. Declared here, not in the snippet: the seam owns
	// effects and must be created during init, and a snippet body is not init.
	const overlayEl = Kernel.element(() => restProps, {
		preset: 'datepicker.months',
		class: 'absolute inset-0 z-1 flex flex-col gap-2 bg-inherit opacity-0',
		state: datePicker,
		as: () => as,
		base: () => base,
		layer: () => presetLayer,
		motion: () => ({ enter: fadeIn, exit: fadeOut })
	});

	const panelEl = Kernel.element(() => EMPTY_PROPS, {
		class: 'flex flex-1 flex-col gap-2',
		motion: () => ({ enter, exit })
	});

	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block, no
	// hydration anchor. A part whose props turn rich after init keeps this leaf (trade-off accepted, 2026-08-26).
	const leaf_overlayEl = Kernel.render(overlayEl);
	const leaf_panelEl = Kernel.render(panelEl);
</script>

{@render (datePicker.isMonthsPickerOpen ? monthsPicker : undefined)?.()}

{#snippet monthsPicker()}
	{@render leaf_overlayEl(overlayEl, monthsOverlay)}
{/snippet}

{#snippet monthsOverlay()}
	{@render leaf_panelEl(panelEl, monthsPanel)}
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
