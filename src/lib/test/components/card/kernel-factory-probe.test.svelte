<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import type { CardRootProps } from '$ixirjs/ui/components/card/types';
	import Reporter from './bond-reporter.test.svelte';

	let {
		onfactory,
		onbond = () => {}
	}: { onfactory?: (bond: CardBond) => void; onbond?: (bond: CardBond) => void } = $props();

	const factory: NonNullable<CardRootProps['factory']> = (props) => {
		const bond = CardBond.create(props);
		onfactory?.(bond);
		return bond;
	};
</script>

<Card.Root {factory} data-testid="factory-root">
	{#snippet children({ card })}
		<Reporter {card} {onbond} />
		<Card.Body>Body</Card.Body>
	{/snippet}
</Card.Root>
