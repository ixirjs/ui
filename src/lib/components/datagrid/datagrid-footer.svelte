<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridFooterProps } from './types';

	const bond = DataGridBond.getOrThrow('DataGrid.Footer must be used within DataGrid.Root.') as DataGridBond<T>;

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridFooterProps<T, E, B> = $props();

	const atom = bond.atom('footer');
	const footerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['$preset', klass, 'contents']}
	{...footerProps}
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
