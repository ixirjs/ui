<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionItemContext } from './bond.svelte';
	import { enterAccordionItemBody, exitAccordionItemBody } from './motion.svelte';
	import type { AccordionItemBodyProps } from './types';

	let { children = undefined, ...restProps }: AccordionItemBodyProps = $props();
	const bond = AccordionItemContext.getOrThrow(
		'<AccordionItem.Body /> must be used within an <AccordionItem.Root />'
	);

	// Real enter/exit transitions through the transition leaf. A body open at mount renders open
	// (`settled`); a body opened later animates.
	const motion = {
		enter: enterAccordionItemBody({ settled: () => bond.parent.settled }),
		exit: exitAccordionItemBody()
	};
	const el = Kernel.element(() => restProps, {
		preset: 'accordion.item.body',
		class: 'box-content h-0 opacity-0',
		state: bond,
		layer: () => bond.props.presets?.body,
		motion: () => motion,
		attrs: () => ({ id: bond.bodyId, role: 'region', 'aria-labelledby': bond.headerId })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor. The inline
	// `Kernel.render(el)(...)` form is a block with an anchor.
	const leaf = Kernel.render(el);
</script>

{@render (bond.isOpen ? body : undefined)?.()}

{#snippet body()}
	{@render leaf(el, children, { accordionItem: bond })}
{/snippet}
