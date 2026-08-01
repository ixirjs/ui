<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { PaginationBond } from './bond.svelte';
	import type { PaginationRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		as = 'nav' as E,
		disabled = false,
		page = $bindable(1),
		pageSize = undefined,
		total = undefined,
		label = 'Pagination',
		factory = undefined,
		children = undefined,
		...restProps
	}: PaginationRootProps<E, B> = $props();

	const root = useRoot(
		PaginationBond,
		{
			disabled: () => disabled,
			// Two-way: Previous/Next commit through this cell, so `bind:page` round-trips.
			page: [() => page, (v: number | undefined) => (page = v ?? 1)],
			pageSize: () => pageSize,
			total: () => total
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory
		}
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		as,
		class: ['pagination', '$preset', klass],
		'aria-label': label,
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ pagination: bond })}
{/snippet}

{@render partElement(el, body)}
