<script lang="ts" module>
	const CELL_ATTRS = { role: 'gridcell' };
	const HIDDEN_CELL_ATTRS = { role: 'gridcell', hidden: true };
</script>

<script lang="ts" generics="T = unknown">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { getDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import type { DatagridCellProps } from '$ixirjs/ui/components/datagrid/types';

	// The row already resolved the grid and hands out cell ordinals for column association.
	const rowRender = getDatagridRowRenderContext();
	const bond = rowRender?.datagrid as DataGridBond<T> | undefined;
	const initialIndex = rowRender?.claimCellIndex();

	const props: DatagridCellProps<T> = $props();

	// The cell IS its `<div>` (`PlainPartProps`): no `as`, no `base`, no motion, and no dispatch —
	// a hidden column's cell carries `hidden` instead of rendering nothing, which is what lets the
	// part be a literal tag with no block, branch or anchor of its own
	// (perf-vs-shadcn-2026-08.md §19).
	const el = Kernel.element(() => props, {
		preset: 'datagrid.cell',
		class: 'border-border flex h-full items-center py-2 text-left',
		state: bond,
		attrs: () =>
			!bond || initialIndex === undefined || !(bond.columnAt(initialIndex)?.props.hidden ?? false)
				? CELL_ATTRS
				: HIDDEN_CELL_ATTRS
	});
</script>

<div {...el.attrs}>{@render props.children?.({ datagrid: bond })}</div>
