<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import type { PresetKey } from '$ixirjs/ui/preset';
	import type { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { getDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
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
		...restProps
	}: DatagridCellProps<T, E, B> & BasePropsOf<B> = $props();

	// Row initialization order and the parent's insertion-ordered column collection are the
	// canonical association on both server and client. One derived, not three: a cell is the
	// highest-volume unit in the library (rows × columns of them), so the old shape — a derived for
	// the merged props, one for the column, one for `hidden` — tripled its signal count for no
	// extra invalidation precision. Consumer `onclick` rides restProps; the removed wrapper only
	// forwarded it.
	const isHidden = $derived(
		!bond || initialIndex === undefined
			? false
			: (bond.columns.values[initialIndex]?.props.hidden ?? false)
	);

	// Cells are static and unregistered. The reactive consumer preset overrides the slot default.
	const el = Kernel.element(
		{
			atom: undefined,
			bond,
			preset: 'datagrid.cell' as PresetKey,
			presetLayer: undefined
		},
		() => ({
			preset,
			class: ['border-border flex h-full items-center py-2 text-left', '$preset', klass],
			...restProps
		})
	);
</script>

<!-- One computed-callee render keeps a hidden cell at one anchor while Kernel selects its leaf. -->
{@render (isHidden ? undefined : Kernel.render(el))?.(el, children, { datagrid: bond })}
