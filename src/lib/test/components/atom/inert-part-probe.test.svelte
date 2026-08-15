<script lang="ts">
	// The inert-part fast path's contract fixture: one bonded card with an inert part (header — no
	// atom, no role), two role-carrying parts (title, description) and the root. The spec next to
	// `define-part.svelte.ts` asserts what registration skipping may and may not change.
	import { Card } from '$ixirjs/ui/components/card';

	let { onbond }: { onbond?: (bond: unknown) => void } = $props();
</script>

<Card.Root data-testid="root">
	{#snippet children({ card })}
		{onbond?.(card)}
		<Card.Header data-testid="header">Header</Card.Header>
		<Card.Title data-testid="title">Title</Card.Title>
		<Card.Description data-testid="description">Description</Card.Description>
		<Card.Body data-testid="body">Body</Card.Body>
	{/snippet}
</Card.Root>
