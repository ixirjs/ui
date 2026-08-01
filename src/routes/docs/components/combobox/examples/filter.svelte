<script lang="ts">
	import { Combobox } from '$lib/components/combobox';
	import { Input } from '$lib/components/input';
	import { Divider } from '$lib/components/divider';
	import { filterDropdownData } from '$lib/components/dropdown';

	const currencies = [
		{ value: 'usd', label: 'US Dollar' },
		{ value: 'eur', label: 'Euro' },
		{ value: 'gbp', label: 'British Pound' },
		{ value: 'jpy', label: 'Japanese Yen' }
	];

	let currencyValue = $state('');
	let currencyLabel = $state('');

	const filteredCurrencies = filterDropdownData(
		() => currencies,
		(query, item) => item.label.toLowerCase().includes(query.toLowerCase())
	);
</script>

<div class="w-64">
	<Combobox.Root bind:value={currencyValue} bind:label={currencyLabel}>
		<Combobox.Trigger base={Input.Root}>
			<Input.Icon class="text-foreground/50">$</Input.Icon>
			<Divider vertical class="mx-1" />
			<Combobox.Control placeholder="Select a currency..." />
		</Combobox.Trigger>
		<Combobox.Content>
			<input
				bind:value={filteredCurrencies.query}
				class="border-border w-full border-b px-4 py-3 text-sm outline-none"
				placeholder="Type to filter..."
			/>
			{#each filteredCurrencies.current as item, i (i)}
				<Combobox.Item value={item.value}>{item.label}</Combobox.Item>
			{/each}
		</Combobox.Content>
	</Combobox.Root>
</div>
