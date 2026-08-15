<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import type { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import Reporter from './bond-reporter.test.svelte';
	import Renderer from '$ixirjs/ui/test/components/atom/custom-renderer.test.svelte';
	let {
		rich = false,
		custom = false,
		withVariants = false,
		onbond,
		onrootclick
	}: {
		rich?: boolean;
		custom?: boolean;
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
				{...rich ? { as: 'h2' as const } : {}}
				{...custom ? { base: Renderer } : {}}
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
