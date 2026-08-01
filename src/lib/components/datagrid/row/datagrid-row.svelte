<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { untrack } from 'svelte';
	import { useRoot } from '@ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { DataGridRowBond, type DataGridRowBondProps } from './bond.svelte';
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
		factory = defaultFactory,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DatagridRowProps<T, E, B> = $props();

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
			factory: (props) => factory(props as DataGridRowBondProps<T>),
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

	function defaultFactory(props: DataGridRowBondProps<T>) {
		return DataGridRowBond.create<T>(props);
	}

	function handleClick(event: MouseEvent) {
		const onClick = onclick as ((event: MouseEvent) => void) | undefined;
		onClick?.(event);
	}
</script>

<HtmlAtom
	{...restProps}
	part={root}
	class={[
		'datagrid-row items-center border-b bg-transparent',
		!isHeader && 'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100',
		isHeader && 'header-tr',
		isSelected && 'bg-primary/2 hover:bg-primary/4 active:bg-primary/6',
		'$preset',
		klass
	]}
	style="--rows:{rows}"
	onclick={handleClick}
>
	{@render children?.({ row: bond })}
</HtmlAtom>
