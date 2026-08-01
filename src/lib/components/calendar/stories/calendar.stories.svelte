<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Calendar as CalendarModule } from '..';
	import {
		addDays,
		addMonths,
		differenceInCalendarDays,
		endOfWeek,
		format,
		startOfDay,
		startOfWeek,
		subMonths
	} from 'date-fns';
	import type { CalendarRange, Day } from '../types';

	const { Story } = defineMeta({
		title: 'Atoms/Calendar',
		parameters: { layout: 'fullscreen' },
		args: {
			type: 'single',
			outsideDays: true
		},
		argTypes: {
			type: {
				control: 'select',
				options: ['single', 'range'],
				description: 'Selection mode: pick a single date or a date range'
			},
			outsideDays: {
				control: 'boolean',
				description: 'Show days from adjacent months to fill the 6-week grid'
			}
		}
	});
</script>

<script lang="ts">
	const today = startOfDay(new Date());

	// Default (configurable story)
	let pivoteDefault = $state(new Date());
	let defaultRange = $state<CalendarRange>([undefined, undefined]);

	// Range Picker
	let rangePicker = $state<CalendarRange>([undefined, undefined]);
	let pivoteRange = $state(new Date());

	// Restricted Dates
	const minDate = addDays(today, -5);
	const maxDate = addDays(today, 20);
	let pivoteRestricted = $state(new Date());

	// With Events
	const eventDays = new Set([
		startOfDay(addDays(today, 1)).getTime(),
		startOfDay(addDays(today, 3)).getTime(),
		startOfDay(addDays(today, 7)).getTime(),
		startOfDay(addDays(today, 12)).getTime()
	]);
	let pivoteEvents = $state(new Date());

	// Two Month Range
	let twoMonthPivote = $state(new Date());
	const twoMonthPivote2 = $derived(addMonths(twoMonthPivote, 1));
	let twoMonthRange = $state<CalendarRange>([undefined, undefined]);

	// Booking Widget
	let bookingRange = $state<CalendarRange>([undefined, undefined]);
	let bookingPivote = $state(new Date());
	const bookingNights = $derived.by(() => {
		if (!bookingRange[0] || !bookingRange[1]) return 0;
		return differenceInCalendarDays(bookingRange[1], bookingRange[0]);
	});

	// Showcase — three pre-seeded calendars side-by-side
	let showcasePivote1 = $state(new Date());
	let showcaseRange1 = $state<CalendarRange>([today, undefined]);
	let showcasePivote2 = $state(new Date());
	let showcaseRange2 = $state<CalendarRange>([addDays(today, -3), addDays(today, 4)]);
	let showcasePivote3 = $state(new Date());

	// Input Date Picker — calendar wired to a text input
	let inputPickerPivote = $state(new Date());
	let inputPickerRange = $state<CalendarRange>([undefined, undefined]);
	const inputPickerDate = $derived(inputPickerRange[0]);

	// Week Picker
	let pivoteWeek = $state(new Date());
	let weekRange = $state<CalendarRange>([undefined, undefined]);

	// Availability Calendar
	let pivoteAvailability = $state(new Date());
	let availabilityRange = $state<CalendarRange>([undefined, undefined]);
	const availabilityData = new Map<number, 'open' | 'limited' | 'full'>([
		[startOfDay(addDays(today, 3)).getTime(), 'full'],
		[startOfDay(addDays(today, 4)).getTime(), 'full'],
		[startOfDay(addDays(today, 9)).getTime(), 'full'],
		[startOfDay(addDays(today, 10)).getTime(), 'full'],
		[startOfDay(addDays(today, 15)).getTime(), 'full'],
		[startOfDay(addDays(today, 16)).getTime(), 'full'],
		[startOfDay(addDays(today, 22)).getTime(), 'full'],
		[startOfDay(addDays(today, 2)).getTime(), 'limited'],
		[startOfDay(addDays(today, 6)).getTime(), 'limited'],
		[startOfDay(addDays(today, 11)).getTime(), 'limited'],
		[startOfDay(addDays(today, 17)).getTime(), 'limited'],
		[startOfDay(addDays(today, 23)).getTime(), 'limited']
	]);

	// Planner — viewport-filling month grid with categorised event chips
	let pivotePlanner = $state(new Date());
	let plannerRange = $state<CalendarRange>([undefined, undefined]);
	type PlannerEvent = { title: string; tone: string };
	const plannerEvents = new Map<number, PlannerEvent[]>([
		[
			startOfDay(today).getTime(),
			[
				{ title: 'Standup', tone: 'bg-primary/10 text-primary' },
				{ title: 'Design review', tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' }
			]
		],
		[
			startOfDay(addDays(today, 1)).getTime(),
			[
				{
					title: 'Client demo · 2pm',
					tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
				}
			]
		],
		[
			startOfDay(addDays(today, 2)).getTime(),
			[
				{ title: 'Sprint planning', tone: 'bg-primary/10 text-primary' },
				{ title: 'Lunch: Bob', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
			]
		],
		[
			startOfDay(addDays(today, 5)).getTime(),
			[{ title: 'Release v2.1', tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' }]
		],
		[
			startOfDay(addDays(today, 7)).getTime(),
			[
				{ title: 'Offsite day 1', tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
				{ title: 'Team dinner', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
			]
		],
		[
			startOfDay(addDays(today, 8)).getTime(),
			[{ title: 'Offsite day 2', tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' }]
		],
		[
			startOfDay(addDays(today, 12)).getTime(),
			[
				{ title: 'Roadmap session', tone: 'bg-primary/10 text-primary' },
				{ title: 'Retro', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
				{ title: 'Board sync', tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' }
			]
		],
		[
			startOfDay(addDays(today, 16)).getTime(),
			[{ title: 'All-hands', tone: 'bg-primary/10 text-primary' }]
		]
	]);
</script>

<!--
	Shared nav header snippet — reused by every compact story.
	Svelte 5 lexical scoping makes it available inside all <Story> content below.
-->
{#snippet monthNavHeader(pivote: Date, onPrev: () => void, onNext: () => void)}
	<div class="flex items-center justify-between px-4 py-3 border-b border-border">
		<button
			aria-label="Previous month"
			class="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
			onclick={onPrev}
		>
			<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
				><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
			>
		</button>
		<span class="text-sm font-semibold">{format(pivote, 'MMMM yyyy')}</span>
		<button
			aria-label="Next month"
			class="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
			onclick={onNext}
		>
			<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
				><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
			>
		</button>
	</div>
{/snippet}

<!-- ─── Default: configurable via Storybook controls ─────────────────────── -->
<Story name="Basic">
	{#snippet template(args: { type: 'single' | 'range'; outsideDays: boolean })}
		<div class="flex flex-col items-center justify-center p-8 min-h-screen">
			<div class="w-80 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
				{@render monthNavHeader(
					pivoteDefault,
					() => (pivoteDefault = subMonths(pivoteDefault, 1)),
					() => (pivoteDefault = addMonths(pivoteDefault, 1))
				)}
				<CalendarModule.Root bind:pivote={pivoteDefault} bind:range={defaultRange} type={args.type}>
					<CalendarModule.Header />
					<CalendarModule.Body weekday={undefined} outsideDays={args.outsideDays}>
						{#snippet children({ day }: { day: Day })}
							<CalendarModule.Day {day} />
						{/snippet}
					</CalendarModule.Body>
				</CalendarModule.Root>
			</div>
			{#if args.type === 'range'}
				<div class="flex items-center gap-2 text-sm mt-4">
					<div class="flex flex-col items-center gap-1">
						<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
							>Start</span
						>
						<span
							class="px-4 py-2 rounded-lg border border-border bg-muted/50 font-medium min-w-32 text-center"
						>
							{defaultRange[0] ? format(defaultRange[0], 'MMM d, yyyy') : '—'}
						</span>
					</div>
					<svg
						viewBox="0 0 24 24"
						class="w-4 h-4 text-muted-foreground mt-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" /></svg
					>
					<div class="flex flex-col items-center gap-1">
						<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
							>End</span
						>
						<span
							class="px-4 py-2 rounded-lg border border-border bg-muted/50 font-medium min-w-32 text-center"
						>
							{defaultRange[1] ? format(defaultRange[1], 'MMM d, yyyy') : '—'}
						</span>
					</div>
				</div>
			{/if}
		</div>
	{/snippet}
</Story>

<!-- ─── Range Picker ─────────────────────────────────────────────────────── -->
<Story name="Range Picker">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen gap-4">
		<div class="w-80 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
			{@render monthNavHeader(
				pivoteRange,
				() => (pivoteRange = subMonths(pivoteRange, 1)),
				() => (pivoteRange = addMonths(pivoteRange, 1))
			)}
			<CalendarModule.Root bind:pivote={pivoteRange} bind:range={rangePicker} type="range">
				<CalendarModule.Header />
				<CalendarModule.Body weekday={undefined}>
					{#snippet children({ day }: { day: Day })}
						<CalendarModule.Day {day} />
					{/snippet}
				</CalendarModule.Body>
			</CalendarModule.Root>
		</div>

		<div class="flex items-center gap-2 text-sm">
			<div class="flex flex-col items-center gap-1">
				<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
					>Start</span
				>
				<span
					class="px-4 py-2 rounded-lg border border-border bg-muted/50 font-medium min-w-32 text-center"
				>
					{rangePicker[0] ? format(rangePicker[0], 'MMM d, yyyy') : '—'}
				</span>
			</div>
			<svg
				viewBox="0 0 24 24"
				class="w-4 h-4 text-muted-foreground mt-5"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" /></svg
			>
			<div class="flex flex-col items-center gap-1">
				<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
					>End</span
				>
				<span
					class="px-4 py-2 rounded-lg border border-border bg-muted/50 font-medium min-w-32 text-center"
				>
					{rangePicker[1] ? format(rangePicker[1], 'MMM d, yyyy') : '—'}
				</span>
			</div>
		</div>

		{#if rangePicker[0] && rangePicker[1]}
			<div class="flex items-center gap-2">
				<span class="text-xs text-muted-foreground">
					{differenceInCalendarDays(rangePicker[1], rangePicker[0])} days selected
				</span>
				<span class="text-muted-foreground/40">·</span>
				<button
					class="text-xs text-muted-foreground hover:text-foreground transition-colors"
					onclick={() => {
						rangePicker = [undefined, undefined];
					}}
				>
					Clear
				</button>
			</div>
		{/if}
	</div>
</Story>

<!-- ─── Restricted Dates ─────────────────────────────────────────────────── -->
<Story name="Restricted Dates">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen gap-4">
		<div class="w-80 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
			{@render monthNavHeader(
				pivoteRestricted,
				() => (pivoteRestricted = subMonths(pivoteRestricted, 1)),
				() => (pivoteRestricted = addMonths(pivoteRestricted, 1))
			)}
			<CalendarModule.Root bind:pivote={pivoteRestricted} type="single" min={minDate} max={maxDate}>
				<CalendarModule.Header />
				<CalendarModule.Body weekday={undefined}>
					{#snippet children({ day }: { day: Day })}
						<CalendarModule.Day {day} />
					{/snippet}
				</CalendarModule.Body>
			</CalendarModule.Root>
		</div>
		<div
			class="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border"
		>
			<svg
				viewBox="0 0 24 24"
				class="w-3.5 h-3.5 shrink-0"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg
			>
			<span>Selectable: {format(minDate, 'MMM d')} – {format(maxDate, 'MMM d, yyyy')}</span>
		</div>
	</div>
</Story>

<!-- ─── With Events: dot indicators ─────────────────────────────────────── -->
<Story name="With Events">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen gap-4">
		<div class="w-80 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
			{@render monthNavHeader(
				pivoteEvents,
				() => (pivoteEvents = subMonths(pivoteEvents, 1)),
				() => (pivoteEvents = addMonths(pivoteEvents, 1))
			)}
			<CalendarModule.Root bind:pivote={pivoteEvents} type="single">
				<CalendarModule.Header />
				<CalendarModule.Body weekday={undefined}>
					{#snippet children({ day }: { day: Day })}
						<CalendarModule.Day {day}>
							{#snippet children({ calendar })}
								<div class="flex items-center justify-center size-full">
									{#if eventDays.has(startOfDay(day.date).getTime()) && !calendar.state.isDaySelected(day)}
										<span
											class="text-[0.82em] leading-none underline underline-offset-2 decoration-primary/70 decoration-[1.5px]"
											>{day.dayOfMonth}</span
										>
									{:else}
										<span class="leading-none">{day.dayOfMonth}</span>
									{/if}
								</div>
							{/snippet}
						</CalendarModule.Day>
					{/snippet}
				</CalendarModule.Body>
			</CalendarModule.Root>
		</div>
		<div class="flex items-center gap-2 text-xs text-muted-foreground">
			<span
				class="text-[0.85em] underline underline-offset-2 decoration-primary/70 decoration-[1.5px]"
				>7</span
			>
			<span>Days with scheduled events</span>
		</div>
	</div>
</Story>

<!-- ─── Two Month Range ──────────────────────────────────────────────────── -->
<Story name="Two Month Range">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen gap-5">
		<div class="rounded-xl border border-border bg-background shadow-lg overflow-hidden">
			<div class="flex items-center px-5 py-3 border-b border-border gap-4">
				<button
					aria-label="Previous month"
					class="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					onclick={() => (twoMonthPivote = subMonths(twoMonthPivote, 1))}
				>
					<svg
						viewBox="0 0 24 24"
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
					>
				</button>
				<span class="text-sm font-semibold flex-1 text-center"
					>{format(twoMonthPivote, 'MMMM yyyy')}</span
				>
				<div class="w-px h-4 bg-border"></div>
				<span class="text-sm font-semibold flex-1 text-center"
					>{format(twoMonthPivote2, 'MMMM yyyy')}</span
				>
				<button
					aria-label="Next month"
					class="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					onclick={() => (twoMonthPivote = addMonths(twoMonthPivote, 1))}
				>
					<svg
						viewBox="0 0 24 24"
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
					>
				</button>
			</div>
			<div class="flex divide-x divide-border">
				<div class="w-72">
					<CalendarModule.Root bind:pivote={twoMonthPivote} bind:range={twoMonthRange} type="range">
						<CalendarModule.Header />
						<CalendarModule.Body weekday={undefined} outsideDays={false}>
							{#snippet children({ day }: { day: Day })}
								<CalendarModule.Day {day} />
							{/snippet}
						</CalendarModule.Body>
					</CalendarModule.Root>
				</div>
				<div class="w-72">
					<CalendarModule.Root pivote={twoMonthPivote2} bind:range={twoMonthRange} type="range">
						<CalendarModule.Header />
						<CalendarModule.Body weekday={undefined} outsideDays={false}>
							{#snippet children({ day }: { day: Day })}
								<CalendarModule.Day {day} />
							{/snippet}
						</CalendarModule.Body>
					</CalendarModule.Root>
				</div>
			</div>
		</div>

		<div class="flex items-center gap-2 text-sm">
			<div class="flex flex-col items-center gap-1">
				<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
					>Start</span
				>
				<span
					class="px-4 py-2 rounded-lg border border-border bg-muted/50 font-medium min-w-32 text-center"
				>
					{twoMonthRange[0] ? format(twoMonthRange[0], 'MMM d, yyyy') : '—'}
				</span>
			</div>
			<svg
				viewBox="0 0 24 24"
				class="w-4 h-4 text-muted-foreground mt-5"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" /></svg
			>
			<div class="flex flex-col items-center gap-1">
				<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
					>End</span
				>
				<span
					class="px-4 py-2 rounded-lg border border-border bg-muted/50 font-medium min-w-32 text-center"
				>
					{twoMonthRange[1] ? format(twoMonthRange[1], 'MMM d, yyyy') : '—'}
				</span>
			</div>
			{#if twoMonthRange[0] && twoMonthRange[1]}
				<div class="flex flex-col items-center gap-1">
					<span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
						>Nights</span
					>
					<span
						class="px-4 py-2 rounded-lg border border-primary/40 bg-primary/5 font-semibold min-w-16 text-center text-primary"
					>
						{differenceInCalendarDays(twoMonthRange[1], twoMonthRange[0])}
					</span>
				</div>
			{/if}
		</div>

		{#if twoMonthRange[0] && twoMonthRange[1]}
			<button
				class="text-xs text-muted-foreground hover:text-foreground transition-colors"
				onclick={() => {
					twoMonthRange = [undefined, undefined];
				}}
			>
				Clear selection
			</button>
		{/if}
	</div>
</Story>

<!-- ─── Booking Widget ───────────────────────────────────────────────────── -->
<Story name="Booking Widget">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen">
		<div class="w-96 rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
			<div class="px-5 pt-5 pb-4 border-b border-border">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-base font-semibold">Select your dates</h2>
						<p class="text-xs text-muted-foreground mt-0.5">Check-in and check-out</p>
					</div>
					<div class="text-right">
						<span class="text-lg font-bold">$175</span>
						<span class="text-xs text-muted-foreground"> / night</span>
					</div>
				</div>
			</div>

			{@render monthNavHeader(
				bookingPivote,
				() => (bookingPivote = subMonths(bookingPivote, 1)),
				() => (bookingPivote = addMonths(bookingPivote, 1))
			)}
			<div class="px-1 pb-1">
				<CalendarModule.Root
					bind:pivote={bookingPivote}
					bind:range={bookingRange}
					type="range"
					min={today}
				>
					<CalendarModule.Header />
					<CalendarModule.Body weekday={undefined}>
						{#snippet children({ day }: { day: Day })}
							<CalendarModule.Day {day} />
						{/snippet}
					</CalendarModule.Body>
				</CalendarModule.Root>
			</div>

			<div class="border-t border-border px-5 py-4">
				<div class="flex gap-3 mb-4">
					<div class="flex-1 rounded-lg border border-border px-3 py-2.5">
						<div
							class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5"
						>
							Check-in
						</div>
						<div class="text-sm font-semibold">
							{bookingRange[0] ? format(bookingRange[0], 'MMM d') : '—'}
						</div>
					</div>
					<div class="flex-1 rounded-lg border border-border px-3 py-2.5">
						<div
							class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5"
						>
							Check-out
						</div>
						<div class="text-sm font-semibold">
							{bookingRange[1] ? format(bookingRange[1], 'MMM d') : '—'}
						</div>
					</div>
				</div>

				{#if bookingNights > 0}
					<div class="flex items-center justify-between text-sm text-muted-foreground mb-4">
						<span>$175 × {bookingNights} {bookingNights === 1 ? 'night' : 'nights'}</span>
						<span class="font-semibold text-foreground">${175 * bookingNights}</span>
					</div>
				{/if}

				<div class="flex gap-2">
					<button
						class="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors disabled:opacity-40"
						disabled={!bookingRange[0]}
						onclick={() => {
							bookingRange = [undefined, undefined];
						}}
					>
						Clear
					</button>
					<button
						class="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
						disabled={!bookingRange[0] || !bookingRange[1]}
					>
						Reserve →
					</button>
				</div>
			</div>
		</div>
	</div>
</Story>

<!-- ─── Showcase: three states side-by-side for quick visual comparison ─── -->
<Story name="Showcase">
	<div class="flex flex-col items-center justify-center p-10 min-h-screen gap-8 bg-muted/30">
		<div>
			<h2 class="text-xl font-semibold text-center">Calendar variants</h2>
			<p class="text-sm text-muted-foreground text-center mt-1">
				All states rendered simultaneously — useful for visual regression.
			</p>
		</div>

		<div class="flex flex-wrap justify-center gap-6">
			<!-- 1. Single select, today pre-selected -->
			<div class="flex flex-col gap-2">
				<span
					class="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center"
					>Single</span
				>
				<div class="w-72 rounded-xl border border-border bg-background shadow-md overflow-hidden">
					{@render monthNavHeader(
						showcasePivote1,
						() => (showcasePivote1 = subMonths(showcasePivote1, 1)),
						() => (showcasePivote1 = addMonths(showcasePivote1, 1))
					)}
					<CalendarModule.Root
						bind:pivote={showcasePivote1}
						bind:range={showcaseRange1}
						type="single"
					>
						<CalendarModule.Header />
						<CalendarModule.Body weekday={undefined}>
							{#snippet children({ day }: { day: Day })}
								<CalendarModule.Day {day} />
							{/snippet}
						</CalendarModule.Body>
					</CalendarModule.Root>
				</div>
			</div>

			<!-- 2. Range, 7-day span pre-selected -->
			<div class="flex flex-col gap-2">
				<span
					class="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center"
					>Range</span
				>
				<div class="w-72 rounded-xl border border-border bg-background shadow-md overflow-hidden">
					{@render monthNavHeader(
						showcasePivote2,
						() => (showcasePivote2 = subMonths(showcasePivote2, 1)),
						() => (showcasePivote2 = addMonths(showcasePivote2, 1))
					)}
					<CalendarModule.Root
						bind:pivote={showcasePivote2}
						bind:range={showcaseRange2}
						type="range"
					>
						<CalendarModule.Header />
						<CalendarModule.Body weekday={undefined}>
							{#snippet children({ day }: { day: Day })}
								<CalendarModule.Day {day} />
							{/snippet}
						</CalendarModule.Body>
					</CalendarModule.Root>
				</div>
			</div>

			<!-- 3. Event dots -->
			<div class="flex flex-col gap-2">
				<span
					class="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center"
					>Events</span
				>
				<div class="w-72 rounded-xl border border-border bg-background shadow-md overflow-hidden">
					{@render monthNavHeader(
						showcasePivote3,
						() => (showcasePivote3 = subMonths(showcasePivote3, 1)),
						() => (showcasePivote3 = addMonths(showcasePivote3, 1))
					)}
					<CalendarModule.Root bind:pivote={showcasePivote3} type="single">
						<CalendarModule.Header />
						<CalendarModule.Body weekday={undefined}>
							{#snippet children({ day }: { day: Day })}
								<CalendarModule.Day {day}>
									{#snippet children({ calendar })}
										<div class="flex flex-col items-center justify-center size-full gap-0.5">
											<span class="text-[0.75em] leading-none">{day.dayOfMonth}</span>
											{#if eventDays.has(startOfDay(day.date).getTime()) && !calendar.state.isDaySelected(day)}
												<span class="w-1 h-1 rounded-full bg-primary/70"></span>
											{:else}
												<span class="w-1 h-1"></span>
											{/if}
										</div>
									{/snippet}
								</CalendarModule.Day>
							{/snippet}
						</CalendarModule.Body>
					</CalendarModule.Root>
				</div>
			</div>
		</div>
	</div>
</Story>

<!-- ─── Input Date Picker: calendar wired to a form field ───────────────── -->
<Story name="Input Date Picker">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen">
		<div class="w-80 flex flex-col gap-5">
			<!-- Form field -->
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="date-input">Appointment date</label>
				<div
					id="date-input"
					role="button"
					tabindex="0"
					class="flex items-center gap-2.5 border border-border rounded-lg px-3 py-2.5 bg-background cursor-pointer hover:border-foreground/30 transition-colors"
				>
					<svg
						viewBox="0 0 24 24"
						class="w-4 h-4 text-muted-foreground shrink-0"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><rect x="3" y="4" width="18" height="18" rx="2" /><path
							d="M16 2v4M8 2v4M3 10h18"
						/></svg
					>
					{#if inputPickerDate}
						<span class="text-sm flex-1">{format(inputPickerDate, 'EEEE, MMMM d, yyyy')}</span>
						<button
							class="text-muted-foreground hover:text-foreground transition-colors ml-auto"
							aria-label="Clear date"
							onclick={(e) => {
								e.stopPropagation();
								inputPickerRange = [undefined, undefined];
							}}
						>
							<svg
								viewBox="0 0 24 24"
								class="w-3.5 h-3.5"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" /></svg
							>
						</button>
					{:else}
						<span class="text-sm text-muted-foreground flex-1">Pick a date</span>
					{/if}
				</div>
				{#if inputPickerDate}
					<p class="text-xs text-muted-foreground">
						{differenceInCalendarDays(inputPickerDate, today) === 0
							? 'Today'
							: differenceInCalendarDays(inputPickerDate, today) > 0
								? `In ${differenceInCalendarDays(inputPickerDate, today)} days`
								: `${Math.abs(differenceInCalendarDays(inputPickerDate, today))} days ago`}
					</p>
				{/if}
			</div>

			<!-- Calendar always visible in this story; in a real app it would be a popover -->
			<div class="rounded-xl border border-border bg-background shadow-lg overflow-hidden">
				{@render monthNavHeader(
					inputPickerPivote,
					() => (inputPickerPivote = subMonths(inputPickerPivote, 1)),
					() => (inputPickerPivote = addMonths(inputPickerPivote, 1))
				)}
				<CalendarModule.Root
					bind:pivote={inputPickerPivote}
					bind:range={inputPickerRange}
					type="single"
				>
					<CalendarModule.Header />
					<CalendarModule.Body weekday={undefined}>
						{#snippet children({ day }: { day: Day })}
							<CalendarModule.Day {day} />
						{/snippet}
					</CalendarModule.Body>
				</CalendarModule.Root>
			</div>
		</div>
	</div>
</Story>

<!-- ─── Week Picker: click any day to select its full week ──────────────── -->
<Story name="Week Picker">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen gap-4">
		<div class="w-80 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
			{@render monthNavHeader(
				pivoteWeek,
				() => (pivoteWeek = subMonths(pivoteWeek, 1)),
				() => (pivoteWeek = addMonths(pivoteWeek, 1))
			)}
			<CalendarModule.Root bind:pivote={pivoteWeek} bind:range={weekRange} type="range">
				<CalendarModule.Header />
				<CalendarModule.Body weekday={undefined}>
					{#snippet children({ day }: { day: Day })}
						<CalendarModule.Day
							{day}
							onclick={() => {
								weekRange = [
									startOfWeek(day.date, { weekStartsOn: 0 }),
									endOfWeek(day.date, { weekStartsOn: 0 })
								];
							}}
						/>
					{/snippet}
				</CalendarModule.Body>
			</CalendarModule.Root>
		</div>

		{#if weekRange[0] && weekRange[1]}
			<div class="flex items-center gap-3">
				<span
					class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20"
				>
					{format(weekRange[0], 'MMM d')} – {format(weekRange[1], 'MMM d, yyyy')}
				</span>
				<button
					class="text-xs text-muted-foreground hover:text-foreground transition-colors"
					onclick={() => {
						weekRange = [undefined, undefined];
					}}
				>
					Clear
				</button>
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Click any day to select that week</p>
		{/if}
	</div>
</Story>

<!-- ─── Availability Calendar: open / limited / full booking states ──────── -->
<Story name="Availability">
	<div class="flex flex-col items-center justify-center p-8 min-h-screen gap-5">
		<div class="w-80 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
			{@render monthNavHeader(
				pivoteAvailability,
				() => (pivoteAvailability = subMonths(pivoteAvailability, 1)),
				() => (pivoteAvailability = addMonths(pivoteAvailability, 1))
			)}
			<CalendarModule.Root
				bind:pivote={pivoteAvailability}
				bind:range={availabilityRange}
				type="single"
				min={today}
			>
				<CalendarModule.Header />
				<CalendarModule.Body weekday={undefined}>
					{#snippet children({ day }: { day: Day })}
						{@const ts = startOfDay(day.date).getTime()}
						{@const avail = day.offmonth || day.disabled ? undefined : availabilityData.get(ts)}
						<CalendarModule.Day {day} class={avail === 'full' ? 'pointer-events-none' : ''}>
							{#snippet children({ calendar })}
								{@const selected = calendar.state.isDaySelected(day)}
								<div class="flex flex-col items-center justify-center size-full gap-px">
									<span
										class={[
											'leading-none text-[0.82em]',
											avail === 'full' && !day.offmonth ? 'opacity-40' : ''
										]}>{day.dayOfMonth}</span
									>
									{#if avail === 'limited'}
										<span
											class={[
												'text-[7px] font-semibold leading-none',
												selected ? 'text-primary-foreground/80' : 'text-amber-500'
											]}>FEW LEFT</span
										>
									{:else if avail === 'full'}
										<span class="text-[7px] font-semibold leading-none text-destructive/60"
											>FULL</span
										>
									{/if}
								</div>
							{/snippet}
						</CalendarModule.Day>
					{/snippet}
				</CalendarModule.Body>
			</CalendarModule.Root>
		</div>

		<div
			class="flex items-center gap-5 text-xs bg-muted/50 px-4 py-2.5 rounded-lg border border-border"
		>
			<span class="text-muted-foreground font-medium">Available</span>
			<span class="flex items-center gap-1.5 text-muted-foreground">
				<span class="text-[7px] font-bold text-amber-500 leading-none">FEW LEFT</span>
				Limited
			</span>
			<span class="flex items-center gap-1.5 text-muted-foreground">
				<span class="text-[7px] font-bold text-destructive/60 leading-none">FULL</span>
				Booked
			</span>
		</div>

		{#if availabilityRange[0]}
			<div class="flex items-center gap-3 text-sm">
				<span class="font-medium">{format(availabilityRange[0], 'EEEE, MMMM d, yyyy')}</span>
				<button
					class="text-xs text-muted-foreground hover:text-foreground transition-colors"
					onclick={() => {
						availabilityRange = [undefined, undefined];
					}}
				>
					Clear
				</button>
			</div>
		{/if}
	</div>
</Story>

<!-- ─── Planner: viewport-filling month grid, type switchable via Controls -->
<Story
	name="Planner"
	parameters={{ layout: 'fullscreen' }}
	args={{ type: 'single' }}
	argTypes={{ type: { control: 'radio', options: ['single', 'range'] } }}
>
	{#snippet template(args: { type: 'single' | 'range' })}
		<!--
			Custom day cell snippet — demonstrates how CalendarDay's children
			snippet fully replaces the default number-centered layout with a
			month-grid agenda cell: day number top-left, weekend accent, today
			pill, off-month dimming, selection ring, and stacked event chips.

			The parent CalendarDay drops its defaults (aspect-square, centered
			hover) via class overrides so the cell can stretch edge-to-edge and
			own its own padding/hover treatment.
		-->
		{#snippet dayCell(day: Day)}
			<CalendarModule.Day
				{day}
				class="aspect-auto h-full flex p-0 hover:bg-transparent hover:text-foreground/80"
			>
				{#snippet children({ calendar })}
					{@const selected = calendar.state.isDaySelected(day)}
					{@const events = plannerEvents.get(startOfDay(day.date).getTime()) ?? []}
					<div
						class={[
							'flex flex-col w-full h-full p-1.5 gap-1 overflow-hidden border-b border-r border-border transition-colors',
							day.offmonth ? 'bg-muted/30' : 'hover:bg-accent/50',
							selected && 'bg-primary/10 hover:bg-primary/10 ring-1 ring-inset ring-primary'
						]}
					>
						<span
							class={[
								'self-start text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full shrink-0',
								day.today
									? 'bg-primary text-primary-foreground'
									: day.weekend
										? 'text-primary'
										: 'text-foreground/80',
								day.offmonth && !day.today && 'text-muted-foreground/50'
							]}
						>
							{day.dayOfMonth}
						</span>

						<div class="flex flex-col gap-1 overflow-hidden">
							{#each events as event (event.title)}
								<span
									class={[
										'flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] leading-tight',
										event.tone
									]}
								>
									<span class="size-1.5 shrink-0 rounded-full bg-current opacity-70"></span>
									<span class="truncate">{event.title}</span>
								</span>
							{/each}
						</div>
					</div>
				{/snippet}
			</CalendarModule.Day>
		{/snippet}

		<div class="flex flex-col w-full h-screen bg-background">
			<div class="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
				<div class="flex items-center gap-1">
					<button
						aria-label="Previous month"
						class="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
						onclick={() => (pivotePlanner = subMonths(pivotePlanner, 1))}
					>
						<svg
							viewBox="0 0 24 24"
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
						>
					</button>
					<button
						aria-label="Next month"
						class="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
						onclick={() => (pivotePlanner = addMonths(pivotePlanner, 1))}
					>
						<svg
							viewBox="0 0 24 24"
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" /></svg
						>
					</button>
				</div>

				<h1 class="text-xl font-semibold tracking-tight">{format(pivotePlanner, 'MMMM yyyy')}</h1>

				<div class="flex items-center gap-3">
					{#if args.type === 'range' && plannerRange[0]}
						<span class="text-sm text-muted-foreground">
							{format(plannerRange[0], 'MMM d')}
							{#if plannerRange[1]}
								→ {format(plannerRange[1], 'MMM d')} · {differenceInCalendarDays(
									plannerRange[1],
									plannerRange[0]
								)}d
							{/if}
						</span>
					{/if}
					<button
						class="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
						onclick={() => {
							pivotePlanner = new Date();
							plannerRange = [undefined, undefined];
						}}
					>
						Today
					</button>
				</div>
			</div>

			<!--
				flex-1 + min-h-0 hands the calendar all remaining viewport height.
				CalendarRoot defaults to h-fit; the h-full override below lets its
				`auto 1fr` grid stretch the body row to fill instead of collapsing
				to content height. Combined with w-full above, the grid fills the
				whole viewport in both axes.
			-->
			<div class="flex-1 min-h-0">
				<CalendarModule.Root
					class="h-full"
					bind:pivote={pivotePlanner}
					bind:range={plannerRange}
					type={args.type}
				>
					<CalendarModule.Header class="border-b border-border" />
					<CalendarModule.Body class="grid-rows-6" weekday={undefined}>
						{#snippet children({ day }: { day: Day })}
							{@render dayCell(day)}
						{/snippet}
					</CalendarModule.Body>
				</CalendarModule.Root>
			</div>
		</div>
	{/snippet}
</Story>
