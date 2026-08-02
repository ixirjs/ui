<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { TreeBond } from './bond.svelte';
	import type { TreeBodyProps } from './types';
	import { attachTreeBodyMotion } from './motion.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: TreeBodyProps<E, B> = $props();

	// An attachment rather than a `defaults` motion phase: identical behavior, but it keeps this
	// part on the native element path instead of the HtmlElement adapter. See the motion module.
	// Key minted once at init; the attachment rides the rest layer under its own stable symbol.
	const motion = attachTreeBodyMotion();
	const motionKey = createAttachmentKey();

	const part = usePart(TreeBond, 'body', () => restProps, {
		preset: () => preset
	});
	const el = usePartElement(part, () => ({
		class: ['overflow-hidden pl-4', '$preset', klass],
		[motionKey]: motion,
		...restProps
	}));
</script>

{@render partElement(el, children, { tree: part.bond })}
