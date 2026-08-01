<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { setDatagridHeaderContext } from './context';
	import { DataGridBond, DataGridHeaderAtom } from './bond.svelte';
	import type { DatagridHeaderProps } from './types';

	const bond = DataGridBond.getOrThrow(
		'DataGrid.Header must be used within DataGrid.Root.'
	) as DataGridBond<T>;

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridHeaderProps<T, E, B> = $props();

	setDatagridHeaderContext({ isHeader: true });

	const atom = createAtomInstance<DataGridHeaderAtom, DataGridBond<T>>('header', {
		bond,
		factory: (owner) => new DataGridHeaderAtom(owner as DataGridBond<T>)
	});
	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['col-span-full grid grid-cols-subgrid', '$preset', klass]}
	{...headerProps}
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
