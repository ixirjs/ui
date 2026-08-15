<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CollapsibleBond } from './bond.svelte';
	const PART = Kernel.part(CollapsibleBond, 'body', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { attachCollapsibleBodyMotion } from './motion.svelte';
	import type { CollapsibleBodyProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: CollapsibleBodyProps<E, B> & BasePropsOf<B> = $props();

	// An attachment keeps this animate-only path on a native element leaf. See the motion module.
	// The key is minted once at init (house rule) — `{@attach}` sugar needs a component/element,
	// so the attachment rides the rest layer under its own stable symbol.
	const motion = attachCollapsibleBodyMotion();
	const motionKey = createAttachmentKey();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const el = Kernel.element(part, () => ({
		class: ['border-border', '$preset', klass],
		[motionKey]: motion,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ collapsible: part.bond },
	el.motion(),
	el
)}
