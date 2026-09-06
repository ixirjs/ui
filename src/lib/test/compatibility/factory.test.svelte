<script lang="ts">
	import { Card } from '@ixirjs/ui';
	import type { CardBond } from '@ixirjs/ui/experimental';
	import { structuralFactory } from './factory-contract.type-test';

	let disabled = $state(false);
	let ref = $state<{ getBond(): CardBond }>();
</script>

<button data-testid="disable-substitute" onclick={() => (disabled = true)}
	>Disable substitute</button
>
<Card.Root factory={structuralFactory} {disabled} bind:this={ref} data-testid="substitute">
	{#snippet children({ card })}
		<output data-testid="substitute-state">{card.isDisabled}</output>
		<output data-testid="substitute-identity">{card === ref?.getBond() || !ref}</output>
	{/snippet}
</Card.Root>
