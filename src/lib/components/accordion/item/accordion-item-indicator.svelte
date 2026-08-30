<script lang="ts">
	import { animate } from '$ixirjs/ui/authoring';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { AccordionItemContext } from './bond.svelte';
	import type { AccordionItemIndicatorProps } from './types';

	let { children = undefined, ...restProps }: AccordionItemIndicatorProps = $props();
	const bond = AccordionItemContext.getOrThrow(
		'<AccordionItem.Indicator /> must be used within an <AccordionItem.Root />'
	);

	// A driver, not a transition: the arrow rotates in place on every open/close.
	const motion = {
		animate: (node: HTMLElement) =>
			animate(node, { rotate: 180 * +bond.isOpen }, { duration: 0.3, ease: 'anticipate' })
	};
	const el = Kernel.element(() => restProps, {
		preset: 'accordion.item.indicator',
		class: 'border-border pointer-events-none flex items-center justify-center',
		state: bond,
		motion: () => motion,
		attrs: () => ({ id: bond.indicatorId, 'data-controled-by': bond.accordionId })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor. The inline
	// `Kernel.render(el)(...)` form is a block with an anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children ? consumerIndicator : defaultIndicator)}

{#snippet consumerIndicator()}
	{@render children?.({ accordionItem: bond })}
{/snippet}

{#snippet defaultIndicator()}
	<Icon src={IconArrowDown} />
{/snippet}
