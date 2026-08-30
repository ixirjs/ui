<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import type { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import Reporter from './bond-reporter.test.svelte';
	// `Card.Title` is its own `<h3>` and takes no `as`/`base`; the leaf ↔ rich switching probe is
	// `test/components/alert/kernel-alert-probe.test.svelte`.
	let {
		withVariants = false,
		onbond,
		onrootclick
	}: {
		withVariants?: boolean;
		onbond: (bond: CardBond) => void;
		onrootclick?: (event: Event) => void;
	} = $props();
</script>

<Card.Root data-extra="yes" {...onrootclick ? { onclick: onrootclick } : {}}>
	{#snippet children({ card })}
		<Reporter {card} {onbond} />
		<Card.Header>
			<Card.Title
				{...withVariants
					? { variants: { variants: { tone: { hot: 'tone-hot' } } }, tone: 'hot' }
					: {}}
				data-testid="title"
			>
				Title
			</Card.Title>
		</Card.Header>
		<Card.Body data-testid="body">Body</Card.Body>
	{/snippet}
</Card.Root>
