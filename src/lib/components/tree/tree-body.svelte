<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TreeContext } from './bond.svelte';
	import { attachTreeBodyMotion } from './motion.svelte';
	import type { TreeBodyProps } from './types';

	let { children = undefined, ...restProps }: TreeBodyProps = $props();
	const bond = TreeContext.getOrThrow('<Tree.Body /> must be used within a <Tree.Root />');

	// The group's id, written here so the header can name it in `aria-controls`.
	const id = Kernel.id(bond.id, 'tree-body');
	bond.bodyId = id;

	// An attachment, not a `motion` phase: an animate-only driver rides the element's own spread and
	// keeps this part on a literal leaf. Handing it to `motion` escalates to `HtmlElement`, which is
	// a component boundary — +2 hydration anchors per part. The key is minted once, at init.
	const motion = attachTreeBodyMotion();
	const motionKey = createAttachmentKey();
	const el = Kernel.element(() => restProps, {
		preset: 'tree.body',
		class: 'overflow-hidden pl-4',
		state: bond,
		layer: () => bond.props.presets?.body,
		attrs: () => ({
			[motionKey]: motion,
			id,
			role: 'group',
			'aria-labelledby': bond.headerId
		})
	});
</script>

<div {...el.attrs}>{@render children?.({ tree: bond })}</div>
