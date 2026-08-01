<script lang="ts">
	import * as Combobox from './atoms';

	let { multiple = false, values = $bindable([]) }: { multiple?: boolean; values?: string[] } =
		$props();

	const items = [
		{ value: 'rust', label: 'Rust' },
		{ value: 'go', label: 'Go' }
	];
</script>

<!-- Items are rendered directly under Root (no popover Content) so the test exercises the
     item-click → selection path without depending on portal/positioning. -->
<Combobox.Root {multiple} bind:values keys={items.map((i) => i.value)}>
	<Combobox.Selections>
		{#snippet children({ selections })}
			{#each selections as selection (selection.id)}
				<Combobox.Selection {selection} data-testid="chip">{selection.label}</Combobox.Selection>
			{/each}
		{/snippet}
	</Combobox.Selections>
	{#each items as item (item.value)}
		<Combobox.Item value={item.value}>{item.label}</Combobox.Item>
	{/each}
</Combobox.Root>
