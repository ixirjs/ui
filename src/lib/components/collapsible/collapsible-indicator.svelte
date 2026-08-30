<script lang="ts">
	import { animate as runAnimation } from '$ixirjs/ui/authoring';
	import { stopMotion } from '$ixirjs/ui/components/element/motion-host';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CollapsibleContext } from './bond.svelte';
	import type { CollapsibleIndicatorProps } from './types';

	let {
		animate = defaultAnimate,
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: CollapsibleIndicatorProps = $props();
	const bond = CollapsibleContext.getOrThrow(
		'<Collapsible.Indicator /> must be used within a <Collapsible.Root />'
	);

	// A driver, not a transition: the arrow rotates in place on mount and every toggle. It rides the
	// element's own spread as an attachment rather than as a `motion` phase — `motion` escalates to
	// `HtmlElement`, a component boundary worth +2 hydration anchors. The key is minted once, at init.
	const motionKey = createAttachmentKey();
	function defaultAnimate(node: HTMLElement) {
		// The cleanup cancels a superseded run; without it every toggle leaves another filled WAAPI
		// animation on the element (what the `motion` driver used to do for this part).
		const controller = runAnimation(
			node,
			{ rotate: 180 * +bond.isOpen },
			{ duration: 0.3, ease: 'anticipate' }
		);
		return () => stopMotion(controller, node);
	}

	const bodyArg = { collapsible: bond };
	const el = Kernel.element(() => restProps, {
		preset: 'collapsible.indicator',
		class: 'border-border flex size-4 items-center justify-center',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => ({ [motionKey]: animate, id: bond.indicatorId, role: 'icon' })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children ?? fallback, bodyArg)}

{#snippet fallback()}
	<Icon src={IconArrowDown} />
{/snippet}
