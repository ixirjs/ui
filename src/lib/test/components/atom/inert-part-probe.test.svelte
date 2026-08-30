<script lang="ts">
	// The inert-part fast path's contract fixture: one bonded card with an inert part (header — no
	// atom, no role), two role-carrying parts (title, description) and the root. The spec next to
	// `define-part.svelte.ts` asserts what registration skipping may and may not change.
	import { Alert } from '$ixirjs/ui/components/alert';

	let { onbond }: { onbond?: (bond: unknown) => void } = $props();
</script>

<Alert.Root data-testid="root">
	{#snippet children({ alert })}
		{onbond?.(alert)}
		<Alert.Content data-testid="header">Header</Alert.Content>
		<Alert.Title data-testid="title">Title</Alert.Title>
		<Alert.Description data-testid="description">Description</Alert.Description>
		<Alert.Actions data-testid="body">Body</Alert.Actions>
	{/snippet}
</Alert.Root>
