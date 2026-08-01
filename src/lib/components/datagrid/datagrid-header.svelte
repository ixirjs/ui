<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '@ixirjs/ui/shared';
	import { setDatagridHeaderContext } from './context';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridHeaderProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridHeaderProps<T, E, B> = $props();

	const part = usePart(DataGridBond, 'header', () => restProps, {
		message: 'DataGrid.Header must be used within DataGrid.Root.',
		preset: () => preset
	});
	const bond = part.bond as DataGridBond<T>;

	setDatagridHeaderContext({ isHeader: true });

	// The explicit `bond` prop HtmlAtom took is exactly `part.bond`, which the seam already carries.
	const el = usePartElement(part, () => ({
		class: ['col-span-full grid grid-cols-subgrid', '$preset', klass],
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ datagrid: bond })}
{/snippet}

{@render partElement(el, body)}
