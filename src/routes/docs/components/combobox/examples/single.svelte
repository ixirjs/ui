<script lang="ts">
	import { Combobox } from '@ixirjs/ui/components/combobox';
	import { Input } from '@ixirjs/ui/components/input';

	const options = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' }
	];

	let singleValue = $state('');
	let singleLabel = $state('');
</script>

<div class="w-64">
	<Combobox.Root bind:value={singleValue} bind:label={singleLabel}>
		{#snippet children({ combobox })}
			<Combobox.Trigger base={Input.Root}>
				<Combobox.Control placeholder="Select an option..." />
			</Combobox.Trigger>
			<Combobox.Content>
				{#each options as option, i (i)}
					<Combobox.Item value={option.value}>{option.label}</Combobox.Item>
				{/each}
			</Combobox.Content>
			<!-- Read the root-owned interface; no factory or manual teardown. -->
			<code class="text-muted-foreground block font-mono text-xs"
				>profile: {combobox.profile.name} · open: {String(combobox.isOpen)}</code
			>
		{/snippet}
	</Combobox.Root>
</div>
