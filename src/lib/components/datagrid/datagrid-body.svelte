<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { DataGridBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '@ixirjs/ui/shared';
	import type { DatagridBodyProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridBodyProps<T, E, B> = $props();

	const part = usePart(DataGridBond, 'body', () => restProps, {
		message: 'DataGrid.Body must be used within DataGrid.Root.',
		preset: () => preset
	});
	const bond = part.bond as DataGridBond<T>;
</script>

<HtmlAtom {...restProps} {bond} {part} class={['contents', '$preset', klass]}>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
