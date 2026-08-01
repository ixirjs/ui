<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '@ixirjs/ui/shared';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridFooterProps<T, E, B> = $props();

	const part = usePart(DataGridBond, 'footer', () => restProps, {
		message: 'DataGrid.Footer must be used within DataGrid.Root.',
		preset: () => preset
	});
	const bond = part.bond as DataGridBond<T>;
</script>

<HtmlAtom {...restProps} {bond} {part} class={['$preset', klass, 'contents']}>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
