<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { PaginationBond, PaginationContext } from './bond.svelte';
	import type { PaginationRootProps } from './types';

	const ID = $props.id();

	let {
		as = 'nav',
		base = undefined,
		disabled = false,
		page = $bindable(1),
		pageSize = undefined,
		total = undefined,
		label = 'Pagination',
		factory = undefined,
		children = undefined,
		...restProps
	}: PaginationRootProps<'nav'> = $props();

	// Live props. Previous/Next commit through the `page` setter, so `bind:page` round-trips.
	const bondProps = {
		get id() {
			return ID;
		},
		get disabled() {
			return disabled;
		},
		get page() {
			return page;
		},
		set page(next: number | undefined) {
			page = next ?? 1;
		},
		get pageSize() {
			return pageSize;
		},
		get total() {
			return total;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = PaginationContext.share(build ? build(bondProps) : PaginationBond.create(bondProps));
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'pagination',
		class: 'pagination',
		state: bond,
		variantProps: () => bondProps,
		as: () => as,
		base: () => base,
		attrs: () => {
			const model = bond.pagination;
			return {
				id: bond.rootId,
				'data-page': model.page,
				'data-page-size': model.pageSize,
				'data-total': model.total,
				'data-page-count': model.pageCount,
				'data-start-index': model.startIndex,
				'data-end-index': model.endIndex,
				'aria-label': label
			};
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { pagination: bond })}
