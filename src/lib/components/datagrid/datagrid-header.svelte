<script lang="ts" module>
	const ROWGROUP = { role: 'rowgroup' };
</script>

<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { DataGridContext, type DataGridBond } from './bond.svelte';
	import { setDatagridHeaderContext } from './context';
	import type { DatagridHeaderProps } from './types';

	const props: DatagridHeaderProps<T, E, B> & BasePropsOf<B> = $props();

	const bond = DataGridContext.getOrThrow(
		'DataGrid.Header must be used within DataGrid.Root.'
	) as DataGridBond<T>;
	setDatagridHeaderContext({ isHeader: true });

	const rowgroup = () => ROWGROUP;
	const el = Kernel.element(() => props, {
		preset: 'datagrid.header',
		class: 'border-border col-span-full grid grid-cols-subgrid',
		state: bond,
		as: () => props.as,
		base: () => props.base,
		attrs: rowgroup
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { datagrid: bond })}
