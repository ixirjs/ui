<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { untrack } from 'svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { DataGridRowBond } from './bond.svelte';
	import type { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { setDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import type { DatagridRowProps } from '$ixirjs/ui/components/datagrid/types';
	import './datagrid-row.css';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		value,
		rows = 'auto',
		data = undefined,
		factory = undefined,
		children = undefined,
		...restProps
	}: DatagridRowProps<T, E, B> & BasePropsOf<B> = $props();

	let nextCellIndex = 0;

	const root = useRoot(
		DataGridRowBond,
		{
			data: () => data,
			value: () => value
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory as never,
			// Cells claim their index and the grid Bond from this context; publish it before the row
			// Atom is created so the render order the cells observe is unchanged. The row Bond already
			// resolved the grid, so cells read it from here instead of walking context again.
			connect: (owner) =>
				setDatagridRowRenderContext({
					claimCellIndex: () => nextCellIndex++,
					datagrid: (owner as DataGridRowBond<T>).datagrid as DataGridBond
				})
		}
	);
	const bond = root.bond as DataGridRowBond<T>;
	const isHeader = $derived(bond.isHeader);
	const isSelected = $derived(bond.isSelected);

	const unmount = untrack(() => (isHeader ? undefined : bond.mount()));
	$effect(() => unmount);

	// Consumer `onclick` rides restProps: the removed wrapper only forwarded it, costing a closure
	// and a live listener on every row even when no consumer handler existed.
	const el = Kernel.element(root, () => ({
		class: [
			'datagrid-row items-center border-b bg-transparent',
			!isHeader && 'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100',
			isHeader && 'header-tr',
			isSelected && 'bg-primary/2 hover:bg-primary/4 active:bg-primary/6',
			'$preset',
			klass
		],
		...restProps,
		style: `--rows:${rows}`
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ row: bond },
	el.motion(),
	el
)}
