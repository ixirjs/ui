<script lang="ts" module>
	const CELL_ATTRS = { role: 'gridcell' };
	const cellAttrs = () => CELL_ATTRS;
</script>

<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { getDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import type { DatagridCellProps } from '$ixirjs/ui/components/datagrid/types';

	// The row already resolved the grid and hands out cell ordinals for column association.
	const rowRender = getDatagridRowRenderContext();
	const bond = rowRender?.datagrid as DataGridBond<T> | undefined;
	const initialIndex = rowRender?.claimCellIndex();

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: DatagridCellProps<T, E, B> & BasePropsOf<B> = $props();

	const isHidden = $derived(
		!bond || initialIndex === undefined
			? false
			: (bond.columnAt(initialIndex)?.props.hidden ?? false)
	);

	const el = Kernel.element(() => restProps, {
		preset: 'datagrid.cell',
		class: 'border-border flex h-full items-center py-2 text-left',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: cellAttrs
	});
	const leaf = Kernel.render(el);
</script>

<!-- One computed-callee render keeps a hidden cell at one anchor. -->
{@render (isHidden ? undefined : leaf)?.(el, children, { datagrid: bond })}
