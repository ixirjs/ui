<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { TreeBond } from './bond.svelte';
	const PART = Kernel.plan(TreeBond, 'indicator', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { animate as runAnimation } from '$ixirjs/ui/shared';
	import { stopMotion } from '$ixirjs/ui/components/element/motion-host';
	import type { TreeIndicatorProps } from './types';

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: TreeIndicatorProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const isOpen = $derived(part.bond.isOpen);

	// An attachment rather than a `defaults` motion phase — see `attachTreeBodyMotion`. There is no
	// `initial` phase here, so rotation runs on mount and every toggle. Key minted once at init.
	function motion(node: HTMLElement) {
		const controller = runAnimation(
			node,
			{ rotate: 90 * +isOpen },
			{ duration: 0.18, ease: 'circOut' }
		);
		return () => stopMotion(controller, node);
	}
	const motionKey = createAttachmentKey();

	const el = Kernel.element(part, () => ({
		class: ['aspect-square h-fit', '$preset', klass],
		[motionKey]: motion,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { tree: part.bond })}
