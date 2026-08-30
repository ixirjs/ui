<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { PaginationContext } from './bond.svelte';
	import type { PaginationPreviousProps } from './types';

	let {
		as = 'button',
		base = undefined,
		children = undefined,
		...restProps
	}: PaginationPreviousProps<'button'> = $props();
	const bond = PaginationContext.getOrThrow(
		'<Pagination.Previous /> must be used within a <Pagination.Root />'
	);

	const el = Kernel.element(() => restProps, {
		preset: 'pagination.previous',
		class: 'pagination-previous',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const model = bond.pagination;
			return {
				id: bond.previousId,
				'aria-disabled': model.hasPrevious ? undefined : 'true',
				'data-disabled': model.hasPrevious ? undefined : '',
				type: as === 'button' ? 'button' : undefined,
				onclick: () => model.previousPage()
			};
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { pagination: bond })}
