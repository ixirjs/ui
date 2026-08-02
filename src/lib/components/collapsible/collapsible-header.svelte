<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '@ixirjs/ui/shared';
	import type { CollapsibleHeaderProps } from './types';
	import { CollapsibleBond } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: CollapsibleHeaderProps<E, B> = $props();

	const part = usePart(CollapsibleBond, 'header', () => restProps, {
		preset: () => preset
	});
	const el = usePartElement(part, () => ({
		class: ['border-border flex cursor-pointer items-center gap-2', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { collapsible: part.bond })}
