<script lang="ts">
	import { animate } from '$ixirjs/ui/authoring';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { stopMotion } from '$ixirjs/ui/components/element/motion-host';
	import { TreeContext } from './bond.svelte';
	import type { TreeIndicatorProps } from './types';

	let {
		open = $bindable(false),
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: TreeIndicatorProps = $props();
	const bond = TreeContext.getOrThrow('<Tree.Indicator /> must be used within a <Tree.Root />');

	// A driver, not a transition: the arrow rotates in place on mount and every toggle. It rides the
	// element's own spread as an attachment rather than as a `motion` phase — `motion` escalates to
	// `HtmlElement`, a component boundary worth +2 hydration anchors. The key is minted once, at init.
	const motionKey = createAttachmentKey();
	// The cleanup cancels a superseded run; without it every toggle leaves another filled WAAPI
	// animation on the element (what the `motion` driver used to do for this part).
	const rotate = (node: HTMLElement) => {
		const controller = animate(
			node,
			{ rotate: 90 * +bond.isOpen },
			{ duration: 0.18, ease: 'circOut' }
		);
		return () => stopMotion(controller, node);
	};
	// Composable on purpose: `as`/`base` stay available to a consumer, and a theme may retag it.
	const el = Kernel.element(() => restProps, {
		preset: 'tree.indicator',
		class: 'border-border aspect-square h-fit',
		state: bond,
		layer: () => bond.props.presets?.indicator,
		as: () => as,
		base: () => base,
		attrs: () => ({ [motionKey]: rotate })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { tree: bond })}
