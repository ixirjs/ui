<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { TreeBond } from './bond.svelte';
	const PART = Kernel.part(TreeBond, 'body', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { TreeBodyProps } from './types';
	import { attachTreeBodyMotion } from './motion.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: TreeBodyProps<E, B> & BasePropsOf<B> = $props();

	// An attachment keeps this animate-only path on a native element leaf. See the motion module.
	// Key minted once at init; the attachment rides the rest layer under its own stable symbol.
	const motion = attachTreeBodyMotion();
	const motionKey = createAttachmentKey();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const el = Kernel.element(part, () => ({
		class: ['overflow-hidden pl-4', '$preset', klass],
		[motionKey]: motion,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ tree: part.bond },
	el.motion(),
	el
)}
