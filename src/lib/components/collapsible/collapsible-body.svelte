<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CollapsibleContext } from './bond.svelte';
	import { attachCollapsibleBodyMotion } from './motion.svelte';
	import type { CollapsibleBodyProps } from './types';

	let { children = undefined, ...restProps }: CollapsibleBodyProps = $props();
	const bond = CollapsibleContext.getOrThrow(
		'<Collapsible.Body /> must be used within a <Collapsible.Root />'
	);

	// An attachment, not a `motion` phase: an animate-only driver rides the element's own spread and
	// keeps this part on a literal leaf. Handing it to `motion` escalates to `HtmlElement`, which is
	// a component boundary — +2 hydration anchors per part. The key is minted once, at init.
	const motion = attachCollapsibleBodyMotion();
	const motionKey = createAttachmentKey();
	const el = Kernel.element(() => restProps, {
		preset: 'collapsible.body',
		class: 'border-border',
		state: bond,
		attrs: () => ({
			[motionKey]: motion,
			id: bond.bodyId,
			'aria-labelledby': bond.headerId,
			'data-state': bond.isOpen ? 'open' : 'closed',
			role: 'region',
			inert: bond.isOpen ? undefined : true
		})
	});
</script>

<div {...el.attrs}>{@render children?.({ collapsible: bond })}</div>
