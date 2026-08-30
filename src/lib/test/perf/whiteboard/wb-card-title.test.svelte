<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './wb-card.svelte';

	// The COMPOSABLE shape: `as` and `base` are honoured through `Kernel.render`. The header next
	// door is the literal shape. Both call the same `Kernel.element`; only the dispatch differs, and
	// a family chooses per part.
	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...rest
	}: {
		class?: string;
		as?: string;
		base?: unknown;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
	const card = CardContext.get();
	const id = card ? Kernel.id(card.id, 'card-title') : undefined;
	if (card) card.titleId = id;

	const el = Kernel.element(() => rest, {
		preset: 'card.title',
		class: 'card-title border-border text-lg leading-none font-semibold tracking-tight',
		state: card,
		as: () => as ?? 'h3',
		base: () => base,
		attrs: () => (id ? { id } : {})
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor. The inline
	// `Kernel.render(el)(...)` form is a block with an anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
