<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { PaginationContext } from './bond.svelte';
	import type { PaginationNextProps } from './types';

	let {
		as = 'button',
		base = undefined,
		children = undefined,
		...restProps
	}: PaginationNextProps<'button'> = $props();
	const bond = PaginationContext.getOrThrow(
		'<Pagination.Next /> must be used within a <Pagination.Root />'
	);

	const el = Kernel.element(() => restProps, {
		preset: 'pagination.next',
		class: 'pagination-next',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const model = bond.pagination;
			return {
				id: bond.nextId,
				'aria-disabled': model.hasNext ? undefined : 'true',
				'data-disabled': model.hasNext ? undefined : '',
				type: as === 'button' ? 'button' : undefined,
				onclick: () => model.nextPage()
			};
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { pagination: bond })}
