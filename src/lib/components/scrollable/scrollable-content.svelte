<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableContentProps } from './types';
	import { ScrollableBond } from './bond.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: ScrollableContentProps<E, B> = $props();

	const part = usePart(ScrollableBond, 'content', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as: 'div',
		class: ['scrollable-content border-border h-full max-h-full', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children)}
