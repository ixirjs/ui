<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { DataGrid as DataGridCmp } from '..';
	import { Select } from '$svelte-atoms/core/components/select';
	import MoreVerticalIcon from '$svelte-atoms/core/icons/icon-more-vert.svelte';
	import ArrowDownIcon from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import { container } from '$svelte-atoms/core/runes/container.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/DataGrid',
		parameters: { layout: 'centered' },
		args: {
			template: undefined,
			fallbackTemplate: 'auto'
		},
		argTypes: {
			template: {
				control: 'text',
				description:
					'Explicit CSS grid-template-columns string (e.g. "auto 1fr 1fr auto auto"). When omitted the grid derives column widths from the Column width props.'
			},
			fallbackTemplate: {
				control: 'text',
				description:
					'Grid-template-columns value used when no column widths are provided. Defaults to "auto".'
			}
		}
	});
</script>

<script lang="ts">
	let values = $state<string[]>([]);

	const teamMembers = [
		{
			id: '1',
			name: 'Alice Chen',
			email: 'alice@acme.io',
			role: 'Product Designer',
			department: 'Design',
			initials: 'AC',
			color: 'bg-violet-500',
			status: 'active' as const
		},
		{
			id: '2',
			name: 'Bob Martinez',
			email: 'bob@acme.io',
			role: 'Frontend Engineer',
			department: 'Engineering',
			initials: 'BM',
			color: 'bg-blue-500',
			status: 'active' as const
		},
		{
			id: '3',
			name: 'Carol Kim',
			email: 'carol@acme.io',
			role: 'Engineering Manager',
			department: 'Engineering',
			initials: 'CK',
			color: 'bg-emerald-500',
			status: 'busy' as const
		},
		{
			id: '4',
			name: 'David Ross',
			email: 'david@acme.io',
			role: 'Backend Engineer',
			department: 'Engineering',
			initials: 'DR',
			color: 'bg-rose-500',
			status: 'active' as const
		},
		{
			id: '5',
			name: 'Eva Wright',
			email: 'eva@acme.io',
			role: 'UX Researcher',
			department: 'Design',
			initials: 'EW',
			color: 'bg-amber-500',
			status: 'away' as const
		},
		{
			id: '6',
			name: 'Frank Garcia',
			email: 'frank@acme.io',
			role: 'DevOps Engineer',
			department: 'Infrastructure',
			initials: 'FG',
			color: 'bg-cyan-500',
			status: 'active' as const
		},
		{
			id: '7',
			name: 'Grace Lee',
			email: 'grace@acme.io',
			role: 'Product Manager',
			department: 'Product',
			initials: 'GL',
			color: 'bg-pink-500',
			status: 'busy' as const
		}
	];

	const statusConfig = {
		active: { label: 'Active', dot: 'bg-green-500' },
		busy: { label: 'Busy', dot: 'bg-amber-500' },
		away: { label: 'Away', dot: 'bg-muted-foreground/40' }
	};

	const inventoryRows = [
		{
			id: 'sku-001',
			code: 'AMX-100',
			store: 'Downtown',
			name: 'Amoxicillin 500mg',
			category: 'Antibiotics'
		},
		{
			id: 'sku-002',
			code: 'ATR-220',
			store: 'Central',
			name: 'Atorvastatin 20mg',
			category: 'Cardio'
		},
		{
			id: 'sku-003',
			code: 'MET-500',
			store: 'Westside',
			name: 'Metformin 500mg',
			category: 'Diabetes'
		},
		{
			id: 'sku-004',
			code: 'IBP-200',
			store: 'North',
			name: 'Ibuprofen 200mg',
			category: 'Pain Relief'
		},
		{ id: 'sku-005', code: 'OMZ-040', store: 'East', name: 'Omeprazole 40mg', category: 'Gastro' },
		{
			id: 'sku-006',
			code: 'AZI-500',
			store: 'South',
			name: 'Azithromycin 500mg',
			category: 'Antibiotics'
		}
	];

	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	const presentLetters = $derived(
		new Set(inventoryRows.map((item) => item.name.charAt(0).toUpperCase()))
	);

	const datagridContainer = container();

	// --- Sortable Columns story state ---
	// `onsort` reports the column's `sortable` field id + the toggled `direction`;
	// we keep it in `sortBy` and derive the ordered rows from it (the grid never mutates data).
	type SortField = 'name' | 'role' | 'department';
	let sortBy = $state<{ field: SortField; direction: 'asc' | 'desc' }>({
		field: 'name',
		direction: 'asc'
	});

	const sortedMembers = $derived.by(() => {
		const { field, direction } = sortBy;
		const ordered = [...teamMembers].sort((a, b) => a[field].localeCompare(b[field]));
		return direction === 'desc' ? ordered.reverse() : ordered;
	});

	function handleSort(_ev: CustomEvent, options: { field?: string; direction: 'asc' | 'desc' }) {
		if (options.field) sortBy = { field: options.field as SortField, direction: options.direction };
	}

	// --- Empty State story ---
	let populated = $state(false);
	const inventoryView = $derived(populated ? inventoryRows.slice(0, 4) : []);
</script>

<!-- Row selection: `<Checkbox>` in the header toggles all rows (indeterminate when partial),
     per-row checkboxes toggle one; selected row ids flow through `bind:values`. -->
<Story name="Basic" args={{ template: undefined, fallbackTemplate: 'auto' }}>
	{#snippet template(args)}
		<div class="flex w-xl flex-col gap-2">
			<code class="font-mono text-xs text-muted-foreground">
				bind:values → [{values.map((v) => `"${v}"`).join(', ')}]
			</code>

			<DataGridCmp.Root bind:values {@attach datagridContainer.attach} {...args}>
				<DataGridCmp.Header>
					<DataGridCmp.Row>
						<DataGridCmp.Column width="auto">
							<DataGridCmp.Checkbox />
						</DataGridCmp.Column>
						<DataGridCmp.Column width="1fr">Member</DataGridCmp.Column>
						<DataGridCmp.Column width="1fr">Role</DataGridCmp.Column>
						<DataGridCmp.Column width="auto">Status</DataGridCmp.Column>
						<DataGridCmp.Column width="auto" />
					</DataGridCmp.Row>
				</DataGridCmp.Header>

				<DataGridCmp.Body>
					{#each teamMembers as member (member.id)}
						<DataGridCmp.Row value={member.id}>
							<DataGridCmp.Cell>
								<DataGridCmp.Checkbox />
							</DataGridCmp.Cell>

							<DataGridCmp.Cell>
								<div class="flex items-center gap-3">
									<div
										class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white {member.color}"
									>
										{member.initials}
									</div>
									<div class="min-w-0">
										<div class="truncate font-medium text-foreground">{member.name}</div>
										<div class="truncate text-xs text-muted-foreground">{member.email}</div>
									</div>
								</div>
							</DataGridCmp.Cell>

							<DataGridCmp.Cell>
								<div class="flex flex-col gap-0.5">
									<span class="text-foreground">{member.role}</span>
									<span class="text-xs text-muted-foreground">{member.department}</span>
								</div>
							</DataGridCmp.Cell>

							<DataGridCmp.Cell>
								{@const cfg = statusConfig[member.status]}
								<span class="inline-flex items-center gap-1.5 whitespace-nowrap">
									<span class="size-2 rounded-full {cfg.dot}"></span>
									{cfg.label}
								</span>
							</DataGridCmp.Cell>

							<DataGridCmp.Cell
								base={Select.Root}
								class="justify-end"
								placement="bottom-end"
								offset={0}
							>
								<Select.Trigger
									class="flex aspect-square items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
								>
									<Icon src={MoreVerticalIcon} />
								</Select.Trigger>
								<Select.List>
									<Select.Item value="view">View Profile</Select.Item>
									<Select.Item value="edit">Edit</Select.Item>
									<Select.Item value="remove">Remove</Select.Item>
								</Select.List>
							</DataGridCmp.Cell>
						</DataGridCmp.Row>
					{/each}
				</DataGridCmp.Body>

				<DataGridCmp.Footer>
					<div
						class="col-span-full flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground"
					>
						<span>{teamMembers.length} members</span>
						{#if values.length > 0}
							<span class="font-medium text-foreground">{values.length} selected</span>
						{/if}
					</div>
				</DataGridCmp.Footer>
			</DataGridCmp.Root>
		</div>
	{/snippet}
</Story>

<!-- Sortable columns: `sortable="<field>"` marks a column clickable; clicking toggles its
     `direction` and fires `onsort` with `{ field, direction }`. The story owns the ordering —
     it sorts a copy from `sortBy` and never mutates the source rows. -->
<Story name="Sortable Columns">
	<div class="flex w-lg flex-col gap-2">
		{#snippet sortIcon(field: SortField)}
			{#if sortBy.field === field}
				<Icon
					src={ArrowDownIcon}
					class="size-3.5 text-foreground transition-transform duration-150 {sortBy.direction ===
					'asc'
						? 'rotate-180'
						: ''}"
				/>
			{:else}
				<!-- placeholder keeps the header label from shifting on hover -->
				<Icon src={ArrowDownIcon} class="size-3.5 text-muted-foreground/30" />
			{/if}
		{/snippet}

		<code class="font-mono text-xs text-muted-foreground">
			sort: {sortBy.field}
			{sortBy.direction === 'asc' ? '↑' : '↓'}
		</code>

		<DataGridCmp.Root>
			<DataGridCmp.Header>
				<DataGridCmp.Row>
					<DataGridCmp.Column width="1fr" sortable="name" onsort={handleSort}>
						<span class="flex items-center gap-1.5">Member {@render sortIcon('name')}</span>
					</DataGridCmp.Column>
					<DataGridCmp.Column width="1fr" sortable="role" onsort={handleSort}>
						<span class="flex items-center gap-1.5">Role {@render sortIcon('role')}</span>
					</DataGridCmp.Column>
					<DataGridCmp.Column width="auto" sortable="department" onsort={handleSort}>
						<span class="flex items-center gap-1.5">Dept {@render sortIcon('department')}</span>
					</DataGridCmp.Column>
				</DataGridCmp.Row>
			</DataGridCmp.Header>

			<DataGridCmp.Body>
				{#each sortedMembers as member (member.id)}
					<DataGridCmp.Row value={member.id}>
						<DataGridCmp.Cell>
							<div class="flex items-center gap-3">
								<div
									class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white {member.color}"
								>
									{member.initials}
								</div>
								<span class="truncate font-medium text-foreground">{member.name}</span>
							</div>
						</DataGridCmp.Cell>
						<DataGridCmp.Cell class="text-foreground">{member.role}</DataGridCmp.Cell>
						<DataGridCmp.Cell class="text-muted-foreground">{member.department}</DataGridCmp.Cell>
					</DataGridCmp.Row>
				{/each}
			</DataGridCmp.Body>
		</DataGridCmp.Root>
	</div>
</Story>

<!-- Empty state: with no rows, the body renders a full-width placeholder spanning every
     column (`col-span-full`, and — being outside a `<Row>` — never enters the selection map).
     A footer action toggles sample data back in. -->
<Story name="Empty State">
	<div class="flex w-lg flex-col gap-2">
		<DataGridCmp.Root>
			<DataGridCmp.Header>
				<DataGridCmp.Row>
					<DataGridCmp.Column width="auto">SKU</DataGridCmp.Column>
					<DataGridCmp.Column width="1fr">Product</DataGridCmp.Column>
					<DataGridCmp.Column width="auto">Category</DataGridCmp.Column>
				</DataGridCmp.Row>
			</DataGridCmp.Header>

			<DataGridCmp.Body>
				{#if inventoryView.length === 0}
					<div
						class="col-span-full flex flex-col items-center justify-center gap-1 px-3 py-12 text-center"
					>
						<span class="font-medium text-foreground">No products yet</span>
						<span class="text-xs text-muted-foreground">
							Add inventory and it will be listed here.
						</span>
					</div>
				{:else}
					{#each inventoryView as item (item.id)}
						<DataGridCmp.Row value={item.id}>
							<DataGridCmp.Cell class="font-mono text-xs font-semibold text-primary">
								{item.code}
							</DataGridCmp.Cell>
							<DataGridCmp.Cell class="font-medium text-foreground">{item.name}</DataGridCmp.Cell>
							<DataGridCmp.Cell class="text-muted-foreground">{item.category}</DataGridCmp.Cell>
						</DataGridCmp.Row>
					{/each}
				{/if}
			</DataGridCmp.Body>

			<DataGridCmp.Footer>
				<div
					class="col-span-full flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground"
				>
					<span>{inventoryView.length} products</span>
					<button
						type="button"
						class="rounded-md px-2 py-1 font-medium text-foreground transition-colors hover:bg-foreground/5"
						onclick={() => (populated = !populated)}
					>
						{populated ? 'Clear' : 'Load sample data'}
					</button>
				</div>
			</DataGridCmp.Footer>
		</DataGridCmp.Root>
	</div>
</Story>

<!-- Layout showcase: a row-spanning A–Z rail aligned to the body via `grid-cols-subgrid`,
     with explicit `grid-template-rows` for the header/body/footer bands. -->
<Story name="Row-Spanning Side Column">
	<DataGridCmp.Root
		class="h-112 gap-0"
		{@attach (node: HTMLElement) => {
			node.style.gridTemplateRows = 'auto 1fr auto';
		}}
	>
		<DataGridCmp.Header class="h-min border-x-0 border-t-0">
			<DataGridCmp.Row class="h-min">
				<DataGridCmp.Column width="44px" />
				<DataGridCmp.Column width="auto">SKU Code</DataGridCmp.Column>
				<DataGridCmp.Column width="auto">Store</DataGridCmp.Column>
				<DataGridCmp.Column width="1fr">Product Name</DataGridCmp.Column>
				<DataGridCmp.Column width="auto">Category</DataGridCmp.Column>
			</DataGridCmp.Row>
		</DataGridCmp.Header>

		<DataGridCmp.Body class="col-span-full grid grid-cols-subgrid">
			<div
				class="row-span-full flex flex-col items-center gap-0.5 overflow-y-auto border-r border-border py-2"
			>
				{#each alphabet as letter (letter)}
					{@const active = presentLetters.has(letter)}
					<span
						class="flex size-7 items-center justify-center rounded text-xs font-medium {active
							? 'text-primary'
							: 'text-muted-foreground/30'}"
					>
						{letter}
					</span>
				{/each}
			</div>

			<div class="col-[2/-1] grid h-min grid-cols-subgrid gap-x-2">
				{#each inventoryRows as item (item.id)}
					<DataGridCmp.Row>
						<DataGridCmp.Cell class="font-mono text-xs font-semibold text-primary">
							{item.code}
						</DataGridCmp.Cell>
						<DataGridCmp.Cell>{item.store}</DataGridCmp.Cell>
						<DataGridCmp.Cell class="font-medium">{item.name}</DataGridCmp.Cell>
						<DataGridCmp.Cell>
							<span
								class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
							>
								{item.category}
							</span>
						</DataGridCmp.Cell>
					</DataGridCmp.Row>
				{/each}
			</div>
		</DataGridCmp.Body>

		<DataGridCmp.Footer
			class="col-span-full border-t border-border px-3 py-2 text-xs text-muted-foreground"
		>
			Row-spanning first column (A-Z rail) + subgrid-aligned content rows
		</DataGridCmp.Footer>
	</DataGridCmp.Root>
</Story>
