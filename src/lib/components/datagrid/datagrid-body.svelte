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

	import type { DatagridBodyProps } from './types';

	const props: DatagridBodyProps<T, E, B> & BasePropsOf<B> = $props();

	const bond = DataGridContext.getOrThrow(
		'DataGrid.Body must be used within DataGrid.Root.'
	) as DataGridBond<T>;

	const rowgroup = () => ROWGROUP;
	const el = Kernel.element(() => props, {
		preset: 'datagrid.body',
		class: 'border-border contents',
		state: bond,
		as: () => props.as,
		base: () => props.base,
		attrs: rowgroup
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { datagrid: bond })}
