<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '@ixirjs/ui/shared';
	import { CollapsibleBond } from './bond.svelte';
	import { attachCollapsibleBodyMotion } from './motion.svelte';
	import type { CollapsibleBodyProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: CollapsibleBodyProps<E, B> = $props();

	// An attachment rather than a `defaults` motion phase: identical behavior, but it keeps this
	// part on the native element path instead of the HtmlElement adapter. See the motion module.
	// The key is minted once at init (house rule) — `{@attach}` sugar needs a component/element,
	// so the attachment rides the rest layer under its own stable symbol.
	const motion = attachCollapsibleBodyMotion();
	const motionKey = createAttachmentKey();

	const part = usePart(CollapsibleBond, 'body', () => restProps, {
		preset: () => preset
	});
	const el = usePartElement(part, () => ({
		class: ['border-border', '$preset', klass],
		[motionKey]: motion,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ collapsible: part.bond })}
{/snippet}

{@render partElement(el, body)}
