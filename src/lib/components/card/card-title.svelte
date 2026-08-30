<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardTitleProps } from './types';

	const props: CardTitleProps = $props();
	// Optional context: a bare <Card.Title> renders without a root. With one, the part hands the
	// root its id at init — the relationship without a registry.
	const card = CardContext.get();
	const id = card ? Kernel.id(card.id, 'card-title') : undefined;
	if (card) card.titleId = id;
	const el = Kernel.element(() => props, {
		preset: 'card.title',
		class: 'card-title border-border text-lg leading-none font-semibold tracking-tight',
		state: card,
		attrs: () => (id ? { id } : {})
	});
</script>

<h3 {...el.attrs}>{@render props.children?.()}</h3>
