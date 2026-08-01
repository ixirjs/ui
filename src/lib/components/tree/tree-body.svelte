<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
	// part on HtmlAtom's native renderer instead of the HtmlElement adapter. See the motion module.
	const motion = attachTreeBodyMotion();

	const part = usePart(TreeBond, 'body', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom class={['overflow-hidden pl-4', '$preset', klass]} {@attach motion} {...restProps} {part}>
	{@render children?.({ tree: part.bond })}
</HtmlAtom>
