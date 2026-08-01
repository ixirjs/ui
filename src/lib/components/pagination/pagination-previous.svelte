<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { PaginationBond } from './bond.svelte';
	import type { PaginationPreviousProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'button' as E,
		children = undefined,
		...restProps
	}: PaginationPreviousProps<E, B> = $props();

	const part = usePart(PaginationBond, 'previous', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as,
		class: ['pagination-previous', '$preset', klass],
		type: as === 'button' ? 'button' : undefined,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ pagination: part.bond })}
{/snippet}

{@render partElement(el, body)}
