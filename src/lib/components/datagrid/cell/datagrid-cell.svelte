<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import type { PresetKey } from '$ixirjs/ui/preset';
	import type { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { getDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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
	}: DatagridCellProps<T, E, B> = $props();

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

	// Atom-less seam: cells are static and unregistered — no Atom, no registration, no HtmlAtom
	// component boundary. The consumer's `preset` rides the config so it stays reactive; the seam
	// carries only the slot default — together that is mergePresetProps' `preset ?? default`.
	const el = usePartElement(
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

<!-- Snippet dispatch instead of an {#if} chain or the `partElement` snippet: a cell is the
     highest-volume unit in the library (rows × columns of them), and hydration anchors are DOM
     nodes. Measured per cell: an {#if} block costs 2 anchor comments, `partElement`'s internal
     dispatch costs 2, one computed-callee render costs 1 — and a hidden cell renders just that
     one anchor. The literal-div branch is the common case (`<svelte:element>` alone costs 3).
     The dispatch reads the same reactive state the branches did, so server and client pick the
     same snippet. HtmlAtom remains the rich-path owner.
     See docs/research/hydration-anchor-diet-2026-08.md. -->
{@render (isHidden
	? undefined
	: el.native()
		? el.tag() === 'div'
			? divCell
			: anyCell
		: richCell)?.()}

{#snippet divCell()}
	<div class={el.class()} {...el.attrs()}>{@render children?.({ datagrid: bond })}</div>
{/snippet}

{#snippet anyCell()}
	<svelte:element this={el.tag()} class={el.class()} {...el.attrs()}
		>{@render children?.({ datagrid: bond })}</svelte:element
	>
{/snippet}

{#snippet richCell()}
	<HtmlAtom {...el.richProps()}>
		{@render children?.({ datagrid: bond })}
	</HtmlAtom>
{/snippet}
