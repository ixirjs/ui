<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { DatePickerContext } from './bond.svelte';
	import { CalendarBond } from '$ixirjs/ui/components/calendar/bond.svelte';
	import { Icon } from '$ixirjs/ui/components/icon';
	import type { DatePickerHeaderProps } from './types';

	const datePickerBond = DatePickerContext.get();
	const calendarBond = CalendarBond.get();

	let {
		as = 'nav',
		base = undefined,
		presetLayer = undefined,
		...restProps
	}: DatePickerHeaderProps = $props();

	const calendarBondProps = $derived(datePickerBond?.props);

	const pivote = $derived(calendarBondProps?.pivote ?? new Date());

	const monthName = $derived(pivote.toLocaleDateString('en-US', { month: 'long' }));
	const year = $derived(pivote.getFullYear());

	function handlePreviousMonth() {
		calendarBond?.previousMonth();
	}

	function handleNextMonth() {
		calendarBond?.nextMonth();
	}

	function handleMonthPicker() {
		if (!datePickerBond) return;
		datePickerBond.openMonthsPicker();
	}

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(() => restProps, {
		preset: 'datepicker.header',
		class: 'border-border flex items-center justify-between gap-2 border-b p-2',
		state: datePickerBond,
		as: () => as ?? 'nav',
		base: () => base,
		layer: () => presetLayer
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block, no
	// hydration anchor. A part whose props turn rich after init keeps this leaf (trade-off accepted, 2026-08-26).
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, headerBody)}

{#snippet headerBody()}
	<button
		type="button"
		class="hover:bg-foreground/10 active:bg-foreground/20 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
		onclick={handlePreviousMonth}
		aria-label="Previous month"
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

	<button
		class="text-foreground h-full flex-1 cursor-pointer text-center text-sm font-semibold"
		onclick={handleMonthPicker}
	>
		{monthName}
		{year}
	</button>

	<button
		type="button"
		class="hover:bg-foreground/10 active:bg-foreground/20 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
		onclick={handleNextMonth}
		aria-label="Next month"
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
{/snippet}
