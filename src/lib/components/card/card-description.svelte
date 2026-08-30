<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardDescriptionProps } from './types';

	const props: CardDescriptionProps = $props();
	// Optional context: a bare <Card.Description> renders without a root. With one, the part hands the
	// root its id at init — the relationship without a registry.
	const card = CardContext.get();
	const id = card ? Kernel.id(card.id, 'card-description') : undefined;
	if (card) card.descriptionId = id;
	const el = Kernel.element(() => props, {
		preset: 'card.description',
		class: 'card-description border-border text-sm text-gray-500',
		state: card,
		attrs: () => (id ? { id } : {})
	});
</script>

<p {...el.attrs}>{@render props.children?.()}</p>
