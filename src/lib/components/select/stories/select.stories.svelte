<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Select as ASelect, type SelectBond, type SelectSelection } from '..';
	import { Input } from '$svelte-atoms/core/components/input';
	import { flip } from 'svelte/animate';
	import { openOverlay } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';

	const { Story } = defineMeta({
		title: 'Atoms/Select',
		parameters: { layout: 'centered' },
		args: {
			multiple: false,
			disabled: false,
			placement: 'bottom-start'
		},
		argTypes: {
			multiple: {
				control: 'boolean',
				description: 'Allow selecting more than one option at a time'
			},
			disabled: {
				control: 'boolean',
				description: 'Prevent the dropdown from opening and all interaction'
			},
			placement: {
				control: 'select',
				options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
				description: 'Preferred placement of the dropdown content relative to the trigger'
			}
		}
	});
</script>

<script lang="ts">
	type Option = { value: string; label: string; group?: string };

	const countries: Option[] = [
		{ value: 'us', label: '🇺🇸 United States' },
		{ value: 'uk', label: '🇬🇧 United Kingdom' },
		{ value: 'de', label: '🇩🇪 Germany' },
		{ value: 'fr', label: '🇫🇷 France' },
		{ value: 'jp', label: '🇯🇵 Japan' },
		{ value: 'br', label: '🇧🇷 Brazil' },
		{ value: 'au', label: '🇦🇺 Australia' },
		{ value: 'ca', label: '🇨🇦 Canada' }
	];

	const team: Option[] = [
		{ value: 'alice', label: '👩‍💻 Alice Chen' },
		{ value: 'bob', label: '👨‍🎨 Bob Martinez' },
		{ value: 'charlie', label: '👨‍🔬 Charlie Kim' },
		{ value: 'diana', label: '👩‍🏫 Diana Ross' },
		{ value: 'evan', label: '👨‍🚀 Evan Wright' },
		{ value: 'fiona', label: '👩‍⚕️ Fiona Garcia' }
	];

	const frameworks: Option[] = [
		{ value: 'svelte', label: 'Svelte', group: 'Compiled' },
		{ value: 'solid', label: 'SolidJS', group: 'Compiled' },
		{ value: 'react', label: 'React', group: 'Virtual DOM' },
		{ value: 'vue', label: 'Vue', group: 'Virtual DOM' },
		{ value: 'preact', label: 'Preact', group: 'Virtual DOM' },
		{ value: 'angular', label: 'Angular', group: 'Full framework' },
		{ value: 'ember', label: 'Ember', group: 'Full framework' }
	];

	const groupedFrameworks = ['Compiled', 'Virtual DOM', 'Full framework'].map((group) => ({
		group,
		items: frameworks.filter((f) => f.group === group)
	}));

	// Resolve trigger labels from the story's own data: item labels come from rendered
	// `[data-label]` DOM, so closed dropdowns (unmounted items) would blank the trigger.
	const selectionsFrom =
		(options: Option[]) =>
		(bond: SelectBond): SelectSelection[] => {
			const byValue = new Map(options.map((o) => [o.value, o]));
			return (bond.props.values ?? []).map((value: string) => ({
				id: value,
				value,
				label: byValue.get(value)?.label ?? value,
				createdAt: new Date(),
				unselect: () => bond.unselect([value])
			}));
		};

	// Per-story bindable state.
	let country = $state<string>();
	let members = $state<string[]>(['alice', 'diana']);
	let framework = $state<string>('svelte');
	let disabledValue = $state<string>('us');

	// Searchable story: `bind:query` two-way-binds the bond's `query` prop (what `Select.Query`
	// writes, and Escape clears via `ClearThenClose`). We filter a derived view off it; `keys`
	// stays the FULL list so a selected-but-filtered-out item keeps its label.
	let countrySearch = $state('');
	const filteredCountries = $derived(
		countries.filter((c) => c.label.toLowerCase().includes(countrySearch.trim().toLowerCase()))
	);

	const itemClass =
		'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5 data-[highlighted=true]:bg-foreground/5 data-[selected]:bg-primary/10 data-[selected]:font-medium data-[selected]:text-primary';
	const contentClass = 'border-border bg-popover z-50 overflow-hidden rounded-lg border shadow-sm';
	const triggerClass =
		'border-border flex h-11 w-full items-center gap-2 rounded-lg border px-3 transition-colors hover:border-foreground/30';
</script>

<!-- Default — fully configurable via Storybook controls (multiple, disabled, placement). -->
<Story name="Basic">
	{#snippet template(args)}
		<div class="flex flex-col gap-2" style="width: 320px;">
			<p class="text-foreground text-sm font-medium">Country</p>
			<ASelect.Root
				keys={countries.map((c) => c.value)}
				multiple={args.multiple}
				disabled={args.disabled}
				placement={args.placement}
			>
				{#snippet children({ select })}
					{@const hasValues = (select.props.values ?? []).length > 0}
					<ASelect.Trigger
						base={Input.Root}
						class={triggerClass}
						onclick={(ev: MouseEvent) => {
							ev.preventDefault();
							openOverlay(select);
						}}
					>
						<div class="text-foreground flex flex-1 flex-wrap items-center gap-1 text-sm">
							<ASelect.Selections getSelections={selectionsFrom(countries)}>
								{#snippet children({ selections })}
									{#each selections as selection (selection.id)}
										{#if args.multiple}
											<ASelect.Selection
												{selection}
												class="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
											>
												{selection.label}
											</ASelect.Selection>
										{:else}
											<span>{selection.label}</span>
										{/if}
									{/each}
								{/snippet}
							</ASelect.Selections>
							{#if !hasValues}
								<span class="text-muted-foreground">
									{args.multiple ? 'Select countries…' : 'Select a country…'}
								</span>
							{/if}
						</div>
						<ASelect.Indicator class="text-muted-foreground shrink-0" />
					</ASelect.Trigger>

					<ASelect.Content class={contentClass}>
						<div class="max-h-60 overflow-auto py-1">
							{#each countries as item (item.value)}
								<ASelect.Item value={item.value} class={itemClass}>
									<span class="flex-1" data-label>{item.label}</span>
									<span
										class="text-primary opacity-0 data-on:opacity-100"
										data-on={(select.props.values ?? []).includes(item.value) ? '' : undefined}
										>✓</span
									>
								</ASelect.Item>
							{/each}
						</div>
					</ASelect.Content>
				{/snippet}
			</ASelect.Root>
		</div>
	{/snippet}
</Story>

<!-- 1. Single select — placeholder, selected display, keyboard-navigable list. -->
<Story name="Single">
	<div class="flex flex-col gap-2" style="width: 320px;">
		<p class="text-foreground text-sm font-medium">Country</p>
		<ASelect.Root keys={countries.map((c) => c.value)} bind:value={country}>
			{#snippet children({ select })}
				<ASelect.Trigger
					base={Input.Root}
					class={triggerClass}
					onclick={(ev: MouseEvent) => {
						ev.preventDefault();
						openOverlay(select);
					}}
				>
					<div class="text-foreground flex flex-1 flex-wrap items-center gap-1 text-sm">
						<ASelect.Selections getSelections={selectionsFrom(countries)}>
							{#snippet children({ selections })}
								{#each selections as selection (selection.id)}
									<span>{selection.label}</span>
								{/each}
							{/snippet}
						</ASelect.Selections>
						{#if !country}
							<span class="text-muted-foreground">Select a country…</span>
						{/if}
					</div>
					<ASelect.Indicator class="text-muted-foreground shrink-0" />
				</ASelect.Trigger>

				<ASelect.Content class={contentClass}>
					<div class="max-h-60 overflow-auto py-1">
						{#each countries as item (item.value)}
							<ASelect.Item value={item.value} class={itemClass}>
								<span class="flex-1" data-label>{item.label}</span>
								<span
									class="text-primary opacity-0 data-on:opacity-100"
									data-on={country === item.value ? '' : undefined}>✓</span
								>
							</ASelect.Item>
						{/each}
					</div>
				</ASelect.Content>
			{/snippet}
		</ASelect.Root>
		<p class="text-muted-foreground text-xs">Selected: <code>{country ?? '—'}</code></p>
	</div>
</Story>

<!-- 2. Multiple select — chips with remove, flip animation. -->
<Story name="Multiple">
	<div class="flex flex-col gap-2" style="width: 380px;">
		<p class="text-foreground text-sm font-medium">Assign team members</p>
		<ASelect.Root keys={team.map((m) => m.value)} bind:values={members} multiple>
			{#snippet children({ select })}
				<ASelect.Trigger
					base={Input.Root}
					class="border-border flex h-auto min-h-11 w-full flex-wrap items-center gap-1 rounded-lg border px-3 py-2 transition-colors hover:border-foreground/30"
					onclick={(ev: MouseEvent) => {
						ev.preventDefault();
						openOverlay(select);
					}}
				>
					<div class="flex flex-1 flex-wrap items-center gap-1">
						<ASelect.Selections getSelections={selectionsFrom(team)}>
							{#snippet children({ selections })}
								{#each selections as selection (selection.id)}
									<div animate:flip={{ duration: 200 }}>
										<ASelect.Selection
											{selection}
											class="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
										>
											{selection.label}
										</ASelect.Selection>
									</div>
								{/each}
							{/snippet}
						</ASelect.Selections>
						{#if members.length === 0}
							<span class="text-muted-foreground text-sm">Select people…</span>
						{/if}
					</div>
					<ASelect.Indicator class="text-muted-foreground shrink-0" />
				</ASelect.Trigger>

				<ASelect.Content class={contentClass}>
					<div class="max-h-60 overflow-auto py-1">
						{#each team as item (item.value)}
							<ASelect.Item value={item.value} class={itemClass}>
								<span class="flex-1" data-label>{item.label}</span>
								<span
									class="text-primary opacity-0 data-on:opacity-100"
									data-on={members.includes(item.value) ? '' : undefined}>✓</span
								>
							</ASelect.Item>
						{/each}
					</div>
				</ASelect.Content>
			{/snippet}
		</ASelect.Root>
		<p class="text-muted-foreground text-xs">Selected: <code>{members.join(', ') || '—'}</code></p>
	</div>
</Story>

<!-- 3. Searchable — built-in `Select.Query` filter box + `createBondFilter`. Escape clears the
     query first (ClearThenClose), then closes. Shows the empty / no-results state. -->
<Story name="Searchable">
	<div class="flex flex-col gap-2" style="width: 320px;">
		<p class="text-foreground text-sm font-medium">Country (type to filter)</p>
		<ASelect.Root
			keys={countries.map((c) => c.value)}
			bind:query={countrySearch}
			bind:value={country}
		>
			{#snippet children({ select })}
				<ASelect.Trigger
					base={Input.Root}
					class={triggerClass}
					onclick={(ev: MouseEvent) => {
						ev.preventDefault();
						openOverlay(select);
					}}
				>
					<div class="text-foreground flex flex-1 flex-wrap items-center gap-1 text-sm">
						<ASelect.Selections getSelections={selectionsFrom(countries)}>
							{#snippet children({ selections })}
								{#each selections as selection (selection.id)}
									<span>{selection.label}</span>
								{/each}
							{/snippet}
						</ASelect.Selections>
						{#if !country}
							<span class="text-muted-foreground">Select a country…</span>
						{/if}
					</div>
					<ASelect.Indicator class="text-muted-foreground shrink-0" />
				</ASelect.Trigger>

				<ASelect.Content class={contentClass}>
					<div class="border-border border-b p-2">
						<ASelect.Query
							class="text-foreground placeholder:text-muted-foreground w-full border-0 bg-transparent px-1 text-sm outline-none"
							placeholder="Search countries…  (Esc clears)"
						/>
					</div>
					<div class="max-h-52 overflow-auto py-1">
						{#each filteredCountries as item (item.value)}
							<div animate:flip={{ duration: 150 }}>
								<ASelect.Item value={item.value} class={itemClass}>
									<span class="flex-1" data-label>{item.label}</span>
									<span
										class="text-primary opacity-0 data-on:opacity-100"
										data-on={country === item.value ? '' : undefined}>✓</span
									>
								</ASelect.Item>
							</div>
						{/each}
						{#if filteredCountries.length === 0}
							<div class="text-muted-foreground px-3 py-6 text-center text-sm">
								No countries match “{countrySearch}”
							</div>
						{/if}
					</div>
				</ASelect.Content>
			{/snippet}
		</ASelect.Root>
	</div>
</Story>

<!-- 4. Grouped — Title + Divider organising items into sections. -->
<Story name="Grouped">
	<div class="flex flex-col gap-2" style="width: 320px;">
		<p class="text-foreground text-sm font-medium">Framework</p>
		<ASelect.Root keys={frameworks.map((f) => f.value)} bind:value={framework}>
			{#snippet children({ select })}
				<ASelect.Trigger
					base={Input.Root}
					class={triggerClass}
					onclick={(ev: MouseEvent) => {
						ev.preventDefault();
						openOverlay(select);
					}}
				>
					<div class="text-foreground flex flex-1 flex-wrap items-center gap-1 text-sm">
						<ASelect.Selections getSelections={selectionsFrom(frameworks)}>
							{#snippet children({ selections })}
								{#each selections as selection (selection.id)}
									<span>{selection.label}</span>
								{/each}
							{/snippet}
						</ASelect.Selections>
						{#if !framework}
							<span class="text-muted-foreground">Pick a framework…</span>
						{/if}
					</div>
					<ASelect.Indicator class="text-muted-foreground shrink-0" />
				</ASelect.Trigger>

				<ASelect.Content class={contentClass}>
					<div class="max-h-72 overflow-auto py-1">
						{#each groupedFrameworks as section, i (section.group)}
							{#if i > 0}
								<ASelect.Divider class="bg-border my-1 h-px" />
							{/if}
							<ASelect.Group>
								<ASelect.Title
									class="text-muted-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wide"
								>
									{section.group}
								</ASelect.Title>
								{#each section.items as item (item.value)}
									<ASelect.Item value={item.value} class={itemClass}>
										<span class="flex-1" data-label>{item.label}</span>
										<span
											class="text-primary opacity-0 data-on:opacity-100"
											data-on={framework === item.value ? '' : undefined}>✓</span
										>
									</ASelect.Item>
								{/each}
							</ASelect.Group>
						{/each}
					</div>
				</ASelect.Content>
			{/snippet}
		</ASelect.Root>
	</div>
</Story>

<!-- 5. Disabled — preselected value, not openable. -->
<Story name="Disabled">
	<div class="flex flex-col gap-2" style="width: 320px;">
		<p class="text-foreground text-sm font-medium">Country (locked)</p>
		<ASelect.Root keys={countries.map((c) => c.value)} bind:value={disabledValue} disabled>
			<ASelect.Trigger
				base={Input.Root}
				class="border-border flex h-11 w-full cursor-not-allowed items-center gap-2 rounded-lg border px-3 opacity-60"
			>
				<div class="text-foreground flex flex-1 flex-wrap items-center gap-1 text-sm">
					<ASelect.Selections getSelections={selectionsFrom(countries)}>
						{#snippet children({ selections })}
							{#each selections as selection (selection.id)}
								<span>{selection.label}</span>
							{/each}
						{/snippet}
					</ASelect.Selections>
					{#if !disabledValue}
						<span class="text-muted-foreground">Select a country…</span>
					{/if}
				</div>
				<ASelect.Indicator class="text-muted-foreground shrink-0" />
			</ASelect.Trigger>

			<ASelect.Content class={contentClass}>
				<div class="py-1">
					{#each countries as item (item.value)}
						<ASelect.Item value={item.value} class={itemClass}>{item.label}</ASelect.Item>
					{/each}
				</div>
			</ASelect.Content>
		</ASelect.Root>
	</div>
</Story>
