<script lang="ts">
	import { Root as Provider } from '$ixirjs/ui/components/root';
	import { Select } from '$ixirjs/ui/components/select';
	import { Combobox } from '$ixirjs/ui/components/combobox';

	let {
		kind = 'select',
		multiple = false
	}: {
		kind?: 'select' | 'combobox';
		multiple?: boolean;
	} = $props();
	let open = $state(true);
	let value = $state<unknown>();
	let values = $state<unknown[]>([]);
	let label = $state('');
	let labels = $state<string[]>([]);
	let query = $state('filter');
	let trace = $state<unknown[]>([]);
	function change(kind: string, next: unknown) {
		// Observe the same callback boundary as an application, before later label/query commits.
		trace.push({ kind, next, label, labels: [...labels], query, open });
	}
</script>

<Provider>
	{@render (kind === 'select' ? select : combobox)()}
	<output data-testid="selection-state"
		>{JSON.stringify({ open, value, values, label, labels, query, trace })}</output
	>
</Provider>

{#snippet select()}
	<Select.Root
		{multiple}
		bind:open
		bind:value
		bind:values
		bind:label
		bind:labels
		bind:query
		onopenchange={(next) => change('open', next)}
		onvaluechange={(next) => change('value', next)}
		onvalueschange={(next) => change('values', next)}
		onquerychange={(next) => change('query', next)}
	>
		<Select.Trigger>Open</Select.Trigger>
		<Select.Content
			><Select.Item value="alpha" data-testid="option">Alpha</Select.Item></Select.Content
		>
	</Select.Root>
{/snippet}

{#snippet combobox()}
	<Combobox.Root
		{multiple}
		bind:open
		bind:value
		bind:values
		bind:label
		bind:labels
		bind:query
		onopenchange={(next) => change('open', next)}
		onvaluechange={(next) => change('value', next)}
		onvalueschange={(next) => change('values', next)}
		onquerychange={(next) => change('query', next)}
	>
		<Combobox.Trigger>Open</Combobox.Trigger>
		<Combobox.Content
			><Combobox.Item value="alpha" data-testid="option">Alpha</Combobox.Item></Combobox.Content
		>
	</Combobox.Root>
{/snippet}
