<script lang="ts" generics="T = unknown">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { LeafAttrs } from '$ixirjs/ui/authoring';
	import { DataGridRowBond, DataGridRowContext } from './bond.svelte';
	import { DataGridRowRecord, type IDataGridRowApi } from './record.svelte';
	import { DataGridContext, type DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import {
		getDatagridHeaderContext,
		setDatagridRowContext,
		setDatagridRowRenderContext
	} from '$ixirjs/ui/components/datagrid/context';
	import type { DatagridRowProps } from '$ixirjs/ui/components/datagrid/types';
	import './datagrid-row.css';

	const ID = $props.id();

	let {
		value,
		rows = 'auto',
		data = undefined,
		factory = undefined,
		children = undefined,
		...restProps
	}: DatagridRowProps<T> = $props();

	const grid = DataGridContext.getOrThrow(
		'DataGridRow must be used within a DataGridBond context.'
	) as DataGridBond<T>;
	const headerContext = getDatagridHeaderContext();
	const isHeader = () => headerContext?.isHeader ?? false;

	// A row is a Bond only when the consumer asks for one through `factory`; by default it is a
	// plain record registered with the grid (`docs/research/datagrid-row-record-2026-08.md`).
	const build = untrack(() => factory);
	const bondProps = {
		get id() {
			return ID;
		},
		get value() {
			return value;
		},
		get data() {
			return data;
		}
	};
	const row: IDataGridRowApi<T> = build
		? (DataGridRowContext.share(
				build(bondProps) as DataGridRowBond
			) as unknown as DataGridRowBond<T>)
		: new DataGridRowRecord<T>(grid, { seed: ID, value: () => value, data: () => data, isHeader });

	let nextCellIndex = 0;
	setDatagridRowContext(row);
	setDatagridRowRenderContext({ claimCellIndex: () => nextCellIndex++, datagrid: grid });

	// `untrack`ed: registering reads the collection's version, and a tracked read here would
	// subscribe the registering effect to the signal it bumps.
	const unmount = row.isHeader ? undefined : untrack(() => row.mount());
	$effect(() => unmount);

	const el = Kernel.element(() => restProps, {
		preset: 'datagrid.row',
		class: 'border-border datagrid-row items-center border-b bg-transparent',
		state: row,
		attrs: () => {
			const header = row.isHeader;
			const selected = !header && row.isSelected;
			const attrs: Record<string, unknown> = {
				id: row.elementId,
				role: 'row',
				class: header
					? 'header-tr'
					: selected
						? 'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100 bg-primary/2 hover:bg-primary/4 active:bg-primary/6'
						: 'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100'
			};
			if (header) attrs['data-header'] = 'true';
			else {
				attrs['aria-selected'] = selected;
				if (selected) attrs['data-selected'] = '';
			}
			if (rows !== 'auto') attrs.style = `--rows:${rows}`;
			return attrs;
		}
	});
</script>

<div {...el.attrs as LeafAttrs}>{@render children?.({ row })}</div>
