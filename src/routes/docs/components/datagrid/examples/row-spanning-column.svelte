<script lang="ts">
	import { DataGrid } from '$lib/components/datagrid';

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
</script>

<DataGrid.Root
	class="h-96 gap-0 overflow-hidden"
	{@attach (node: HTMLElement) => {
		node.style.gridTemplateRows = 'auto 1fr auto';
	}}
>
	<DataGrid.Header class="h-min border-x-0 border-t-0">
		<DataGrid.Row class="h-min" header>
			<DataGrid.Column width="44px" />
			<DataGrid.Column width="auto" class="pl-4">SKU Code</DataGrid.Column>
			<DataGrid.Column width="auto">Store</DataGrid.Column>
			<DataGrid.Column width="1fr">Product Name</DataGrid.Column>
			<DataGrid.Column width="auto">Category</DataGrid.Column>
		</DataGrid.Row>
	</DataGrid.Header>

	<DataGrid.Body class="col-span-full grid grid-cols-subgrid">
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
				<DataGrid.Row value={item.id}>
					<DataGrid.Cell class="font-mono text-xs font-semibold text-primary">
						{item.code}
					</DataGrid.Cell>
					<DataGrid.Cell>{item.store}</DataGrid.Cell>
					<DataGrid.Cell class="font-medium">{item.name}</DataGrid.Cell>
					<DataGrid.Cell>
						<span
							class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
						>
							{item.category}
						</span>
					</DataGrid.Cell>
				</DataGrid.Row>
			{/each}
		</div>
	</DataGrid.Body>

	<DataGrid.Footer
		class="col-span-full border-t border-border px-3 py-2 text-xs text-muted-foreground"
	>
		Use row-span-full on the side rail and col-[2/-1] on row wrappers to keep all body rows aligned
	</DataGrid.Footer>
</DataGrid.Root>
