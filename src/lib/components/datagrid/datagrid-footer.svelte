<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridFooterProps } from './types';

	const bond = (DataGridBond.get() as DataGridBond<T> | undefined);
	if (!bond) {
		throw new Error('DataGrid.Footer must be used within DataGrid.Root.');
	}

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridFooterProps<T, E, B> = $props();

	const atom = bond.atom('footer');
	const footerProps = $derived({ preset: preset ?? atom.preset, ...atom.spread, ...restProps });
</script>

<HtmlAtom
	{bond}
	class={['$preset', klass, 'contents']}
	{...footerProps}
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
