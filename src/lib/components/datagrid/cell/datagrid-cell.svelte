<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { DataGridBond } from '../bond.svelte';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { DatagridCellProps } from '../types';

	const bond = (DataGridBond.get() as DataGridBond<T> | undefined);

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DatagridCellProps<T, E, B> = $props();

	const cellProps = $derived(mergePresetProps(preset, 'datagrid.cell', restProps));

	let element = $state<HTMLElement | undefined>();

	// Find the matching column by this cell's DOM index
	const column = $derived.by(() => {
		if (!element || !bond) return undefined;

		const index = Array.from(element.parentElement?.children ?? []).indexOf(element);
		if (index === -1) return undefined;

		for (const col of bond.state.columns.values) {
			if (col.index === index) return col;
		}

		return undefined;
	});

	const isHidden = $derived(column?.state.props.hidden ?? false);

	function handleClick(ev: Event) {
		onclick?.(ev, { ...(bond && { cell: bond }) });
	}
</script>

{#if !isHidden}
	<HtmlAtom
		{@attach (node: HTMLElement) => { element = node; }}
		{bond}
		class={['border-border flex h-full items-center py-2 text-left', '$preset', klass]}
		onclick={handleClick}
		{...cellProps}
	>
		{@render children?.({ datagrid: bond })}
	</HtmlAtom>
{/if}
