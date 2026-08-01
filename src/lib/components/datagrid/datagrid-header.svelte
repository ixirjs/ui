<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { setDatagridHeaderContext } from './context';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridHeaderProps } from './types';

	const bond = DataGridBond.getOrThrow('DataGrid.Header must be used within DataGrid.Root.') as DataGridBond<T>;

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridHeaderProps<T, E, B> = $props();

	setDatagridHeaderContext({ isHeader: true });

	const atom = bond.atom('header');
	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['col-span-full grid grid-cols-subgrid', '$preset', klass]}
	{...headerProps}
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
