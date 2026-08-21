<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
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

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		as,
		class: ['pagination', '$preset', klass],
		'aria-label': label,
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { pagination: bond })}
