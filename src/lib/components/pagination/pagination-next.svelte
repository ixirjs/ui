<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { PaginationBond } from './bond.svelte';
	import type { PaginationNextProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'button' as E,
		children = undefined,
		...restProps
	}: PaginationNextProps<E, B> = $props();

	const part = usePart(PaginationBond, 'next', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as,
		class: ['pagination-next', '$preset', klass],
		type: as === 'button' ? 'button' : undefined,
		...restProps
	}));
</script>

{@render partElement(el, children, { pagination: part.bond })}
