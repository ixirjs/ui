<script lang="ts">
	import * as Input from './atoms';

	let { value = $bindable('') }: { value?: string } = $props();
</script>

<Input.Root>
	{#snippet children({ input })}
		<Input.Control bind:value placeholder="field" />
		<!-- `bond.value.get()` reflects `props.value`, which Input.Control writes via `bond.value.set`. -->
		<output data-testid="model">{input.value.get()}</output>
	{/snippet}
</Input.Root>
<output data-testid="out">{value}</output>
