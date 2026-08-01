<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import type { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { getDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { DatagridCellProps } from '$ixirjs/ui/components/datagrid/types';

	// One context read, not two: the row publishes the grid Bond it already resolved alongside the
	// cell ordinal. A cell rendered outside a row has neither, exactly as before.
	const rowRender = getDatagridRowRenderContext();
	const bond = rowRender?.datagrid as DataGridBond<T> | undefined;
	const initialIndex = rowRender?.claimCellIndex();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DatagridCellProps<T, E, B> = $props();

	const cellProps = $derived(mergePresetProps(preset, 'datagrid.cell', restProps));

	// Row initialization order and the parent's insertion-ordered column collection are the
	// canonical association on both server and client. This avoids allocating a parent-children
	// array for every cell after hydration; collection changes still invalidate the lookup.
	const column = $derived(
		!bond || initialIndex === undefined ? undefined : bond.columns.values[initialIndex]
	);

	const isHidden = $derived(column?.props.hidden ?? false);

	function handleClick(event: MouseEvent) {
		const onClick = onclick as ((event: MouseEvent) => void) | undefined;
		onClick?.(event);
	}
</script>

{#if !isHidden}
	<HtmlAtom
		{bond}
		class={['border-border flex h-full items-center py-2 text-left', '$preset', klass]}
		onclick={handleClick}
		{...cellProps}
	>
		{@render children?.({ datagrid: bond })}
	</HtmlAtom>
{/if}
