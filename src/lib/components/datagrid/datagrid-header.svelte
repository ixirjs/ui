<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { setDatagridHeaderContext } from './context';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridHeaderProps } from './types';

	const props: DatagridHeaderProps<T, E, B> & BasePropsOf<B> = $props();

	const el = definePart(DataGridBond, 'header', () => props, {
		class: 'col-span-full grid grid-cols-subgrid',
		message: 'DataGrid.Header must be used within DataGrid.Root.'
	});

	setDatagridHeaderContext({ isHeader: true });
</script>

{@render Kernel.render(el)(el, props.children, { datagrid: el.bond as DataGridBond<T> })}
