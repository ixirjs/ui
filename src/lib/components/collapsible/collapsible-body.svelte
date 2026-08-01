<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
	// part on HtmlAtom's native renderer instead of the HtmlElement adapter. See the motion module.
	const motion = attachCollapsibleBodyMotion();

	const part = usePart(CollapsibleBond, 'body', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom class={['border-border', '$preset', klass]} {@attach motion} {...restProps} {part}>
	{@render children?.({ collapsible: part.bond })}
</HtmlAtom>
