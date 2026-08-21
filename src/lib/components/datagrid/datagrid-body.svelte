<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DataGridBond } from './bond.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import type { DatagridBodyProps } from './types';

	const props: DatagridBodyProps<T, E, B> & BasePropsOf<B> = $props();

	const el = definePart(DataGridBond, 'body', () => props, {
		class: 'contents',
		message: 'DataGrid.Body must be used within DataGrid.Root.'
	});
</script>

{@render Kernel.render(el)(el, props.children, { datagrid: el.bond as DataGridBond<T> })}
