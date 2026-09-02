<script lang="ts">
	// L4: `Card.Header` passes `state: CardContext` (a context HANDLE, not a resolved Bond) since
	// its only other use of the Bond was `state:`. This proves the handle still reaches a
	// function-form preset entry's `{ bond }` — `needsState` must see `typeof entry === 'function'`
	// and resolve the handle before the entry runs.
	import { Card } from '$ixirjs/ui/components/card';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	setPreset({
		...defaultPreset,
		'card.header': ({ bond }) => ({
			class: 'kernel-custom-header',
			attrs: { 'data-bond-id': (bond as { id?: string } | undefined)?.id }
		})
	});
</script>

<Card.Root>
	<Card.Header>Header</Card.Header>
</Card.Root>
