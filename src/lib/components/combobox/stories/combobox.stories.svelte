<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Combobox as ACombobox } from '..';
	import { Input } from '$ixirjs/ui/components/input';
	import { flip } from 'svelte/animate';

	const { Story } = defineMeta({
		title: 'Atoms/Combobox',
		parameters: { layout: 'centered' },
		args: {
			multiple: false,
			disabled: false,
			placeholder: 'Search a language…'
		},
		argTypes: {
			multiple: {
				control: 'boolean',
				description: 'Allow selecting multiple values (chips mode)'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the combobox'
			},
			placeholder: {
				control: 'text',
				description: 'Placeholder text shown in the search input'
			}
		}
	});
</script>

<script lang="ts">
	type Option = { value: string; label: string };

	const languages: Option[] = [
		{ value: 'Rust', label: 'Rust' },
		{ value: 'Go', label: 'Go' },
		{ value: 'TypeScript', label: 'TypeScript' },
		{ value: 'Python', label: 'Python' },
		{ value: 'Elixir', label: 'Elixir' },
		{ value: 'Zig', label: 'Zig' },
		{ value: 'Swift', label: 'Swift' }
	];

	// `bind:query` two-way-binds each Root's `query` prop — what `Combobox.Query` writes and
	// Escape clears (`ClearThenClose`). We filter a derived view off it. `keys` stays the FULL
	// list so a selected-but-filtered-out item keeps its chip/label.
	const allKeys = languages.map((l) => l.value);
	const match = (q: string) => (l: Option) =>
		l.label.toLowerCase().includes(q.trim().toLowerCase());

	// Default story state
	let defaultValue = $state<string>();
	let defaultValues = $state<string[]>([]);
	let defaultSearch = $state('');
	const defaultFiltered = $derived(languages.filter(match(defaultSearch)));

	let single = $state<string>();
	let searchA = $state('');
	const filteredA = $derived(languages.filter(match(searchA)));

	let split = $state<string>();
	let searchB = $state('');
	const filteredB = $derived(languages.filter(match(searchB)));

	let many = $state<string[]>([]);
	let searchC = $state('');
	const filteredC = $derived(languages.filter(match(searchC)));

	// Surface + row look lives in the shared stories preset (`combobox.content` `flat` variant /
	// `combobox.item` `flat` variant); the trigger field look is the `combobox.trigger` default.
	const inputClass =
		'text-foreground placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent text-sm outline-none';
</script>

<!-- Selected-state check icon, reused by the item lists below. -->
{#snippet checkIcon()}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-3.5">
		<path d="M20 6 9 17l-5-5" />
	</svg>
{/snippet}

<!-- 0. Default — configurable via Storybook controls. Supports both single and multiple modes. -->
<Story name="Basic">
	{#snippet template(args)}
		<div class="flex flex-col gap-2" style="width: 340px;">
			<p class="text-foreground text-sm font-medium">Language</p>
			<ACombobox.Root
				keys={allKeys}
				bind:query={defaultSearch}
				bind:value={defaultValue}
				bind:values={defaultValues}
				multiple={args.multiple}
				disabled={args.disabled}
			>
				<ACombobox.Trigger
					base={Input.Root}
					class="flex h-auto min-h-11 w-full flex-wrap items-center gap-1 px-3 py-2"
				>
					{#if args.multiple}
						<ACombobox.Selections class="flex flex-wrap gap-1">
							{#snippet children({ selections })}
								{#each selections as selection (selection.id)}
									<div animate:flip={{ duration: 200 }}>
										<ACombobox.Selection
											{selection}
											class="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
										>
											{selection.label}
										</ACombobox.Selection>
									</div>
								{/each}
							{/snippet}
						</ACombobox.Selections>
					{/if}
					<ACombobox.Query class={inputClass} placeholder={args.placeholder} />
				</ACombobox.Trigger>

				<ACombobox.Content variant="flat" class="z-50 overflow-hidden">
					<div class="max-h-60 overflow-auto py-1">
						{#each defaultFiltered as item (item.value)}
							<div animate:flip={{ duration: 150 }}>
								<ACombobox.Item value={item.value} variant="flat">
									<span class="flex-1">{item.label}</span>
									{#if args.multiple}
										<span
											class="text-primary opacity-0 data-on:opacity-100"
											data-on={defaultValues.includes(item.value) ? '' : undefined}
											>{@render checkIcon()}</span
										>
									{:else}
										<span
											class="text-primary opacity-0 data-on:opacity-100"
											data-on={defaultValue === item.value ? '' : undefined}
											>{@render checkIcon()}</span
										>
									{/if}
								</ACombobox.Item>
							</div>
						{/each}
						{#if defaultFiltered.length === 0}
							<div class="text-muted-foreground px-3 py-6 text-center text-sm">
								No language matches "{defaultSearch}"
							</div>
						{/if}
					</div>
				</ACombobox.Content>
			</ACombobox.Root>
			<p class="text-muted-foreground text-xs">
				{#if args.multiple}
					Selected: <code>{defaultValues.join(', ') || '—'}</code>
				{:else}
					Value: <code>{defaultValue ?? '—'}</code>
				{/if}
			</p>
		</div>
	{/snippet}
</Story>

<!-- 1. Autocomplete (single) — one filter box in the trigger; the picked item shows as a chip
     beside it. Typing filters (`Combobox.Query` -> `query`); selecting commits the value. -->
<Story name="Autocomplete">
	<div class="flex flex-col gap-2" style="width: 340px;">
		<p class="text-foreground text-sm font-medium">Language</p>
		<ACombobox.Root keys={allKeys} bind:query={searchA} bind:value={single}>
			<ACombobox.Trigger base={Input.Root} class="flex h-11 w-full items-center gap-1 px-3">
				<ACombobox.Selections class="flex flex-wrap gap-1">
					{#snippet children({ selections })}
						{#each selections as selection (selection.id)}
							<span class="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium">
								{selection.label}
							</span>
						{/each}
					{/snippet}
				</ACombobox.Selections>
				<ACombobox.Query class={inputClass} placeholder="Search a language…" />
			</ACombobox.Trigger>

			<ACombobox.Content variant="flat" class="z-50 overflow-hidden">
				<div class="max-h-60 overflow-auto py-1">
					{#each filteredA as item (item.value)}
						<div animate:flip={{ duration: 150 }}>
							<ACombobox.Item value={item.value} variant="flat">{item.label}</ACombobox.Item>
						</div>
					{/each}
					{#if filteredA.length === 0}
						<div class="text-muted-foreground px-3 py-6 text-center text-sm">
							No language matches "{searchA}"
						</div>
					{/if}
				</div>
			</ACombobox.Content>
		</ACombobox.Root>
		<p class="text-muted-foreground text-xs">Value: <code>{single ?? '—'}</code></p>
	</div>
</Story>

<!-- 2. Value + Search (two independent inputs) — the trigger `Control` is the VALUE box (shows
     the selected item's value); a separate `Query` box in the content filters. Typing in one
     never touches the other. -->
<Story name="Value + Search">
	<div class="flex flex-col gap-2" style="width: 340px;">
		<p class="text-foreground text-sm font-medium">Language</p>
		<ACombobox.Root keys={allKeys} bind:query={searchB} bind:value={split}>
			<ACombobox.Trigger base={Input.Root} class="flex h-11 w-full items-center gap-2 px-3">
				<ACombobox.Control class={inputClass} placeholder="No language selected" />
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="text-muted-foreground size-4"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</ACombobox.Trigger>

			<ACombobox.Content variant="flat" class="z-50 overflow-hidden">
				<div class="border-border border-b p-2">
					<ACombobox.Query class={inputClass} placeholder="Search…  (Esc clears)" />
				</div>
				<div class="max-h-52 overflow-auto py-1">
					{#each filteredB as item (item.value)}
						<div animate:flip={{ duration: 150 }}>
							<ACombobox.Item value={item.value} variant="flat">
								<span class="flex-1" data-label>{item.label}</span>
								<span
									class="text-primary opacity-0 data-on:opacity-100"
									data-on={split === item.value ? '' : undefined}>{@render checkIcon()}</span
								>
							</ACombobox.Item>
						</div>
					{/each}
					{#if filteredB.length === 0}
						<div class="text-muted-foreground px-3 py-6 text-center text-sm">No matches</div>
					{/if}
				</div>
			</ACombobox.Content>
		</ACombobox.Root>
		<p class="text-muted-foreground text-xs">
			Value box: <code>{split ?? '—'}</code> · Search: <code>{searchB || '—'}</code>
		</p>
	</div>
</Story>

<!-- 3. Multiple (chips) — filter in the trigger, toggle items in the list, removable chips via
     `Combobox.Selections` / `Combobox.Selection`. -->
<Story name="Multiple">
	<div class="flex flex-col gap-2" style="width: 380px;">
		<p class="text-foreground text-sm font-medium">Languages you know</p>
		<ACombobox.Root keys={allKeys} bind:query={searchC} bind:values={many} multiple>
			<ACombobox.Trigger
				base={Input.Root}
				class="flex h-auto min-h-11 w-full flex-wrap items-center gap-1 px-3 py-2"
			>
				<ACombobox.Selections class="flex flex-wrap gap-1">
					{#snippet children({ selections })}
						{#each selections as selection (selection.id)}
							<div animate:flip={{ duration: 200 }}>
								<ACombobox.Selection
									{selection}
									class="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
								>
									{selection.label}
								</ACombobox.Selection>
							</div>
						{/each}
					{/snippet}
				</ACombobox.Selections>
				<ACombobox.Query class={inputClass} placeholder="Filter…" />
			</ACombobox.Trigger>

			<ACombobox.Content variant="flat" class="z-50 overflow-hidden">
				<div class="max-h-60 overflow-auto py-1">
					{#each filteredC as item (item.value)}
						<div animate:flip={{ duration: 150 }}>
							<ACombobox.Item value={item.value} variant="flat">
								<span class="flex-1" data-label>{item.label}</span>
								<span
									class="text-primary opacity-0 data-on:opacity-100"
									data-on={many.includes(item.value) ? '' : undefined}>{@render checkIcon()}</span
								>
							</ACombobox.Item>
						</div>
					{/each}
					{#if filteredC.length === 0}
						<div class="text-muted-foreground px-3 py-6 text-center text-sm">No matches</div>
					{/if}
				</div>
			</ACombobox.Content>
		</ACombobox.Root>
		<p class="text-muted-foreground text-xs">Selected: <code>{many.join(', ') || '—'}</code></p>
	</div>
</Story>
