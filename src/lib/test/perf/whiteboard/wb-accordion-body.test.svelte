<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionItemContext } from './wb-accordion.svelte';
	import {
		enterAccordionItemBody,
		exitAccordionItemBody
	} from '$ixirjs/ui/components/accordion/item/motion.svelte';

	let {
		children = undefined,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
	const item = AccordionItemContext.getOrThrow('This part must be used within a WbAccordionItem.');

	// Real enter/exit transitions through `Kernel.render`'s transition leaf — the same recipes the
	// shipped Accordion uses; instant for a body that was open at mount (`settled`).
	const motion = {
		enter: enterAccordionItemBody({ settled: () => item.root.settled }),
		exit: exitAccordionItemBody()
	};
	const el = Kernel.element(() => rest, {
		preset: 'accordion.item.body',
		class: 'box-content h-0 opacity-0',
		state: item,
		motion: () => motion,
		attrs: () => ({ id: item.bodyId, role: 'region', 'aria-labelledby': item.headerId })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor. The inline
	// `Kernel.render(el)(...)` form is a block with an anchor.
	const leaf = Kernel.render(el);
</script>

{@render (item.isOpen ? body : undefined)?.()}

{#snippet body()}
	{@render leaf(el, children)}
{/snippet}
