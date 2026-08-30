<script lang="ts">
	// PROTOTYPE, not product. A DataGrid row that is NOT a Bond root.
	//
	// It does everything the real row must still do — registers with the grid so `rows`,
	// `selectedRows` and `isSelected` keep working, publishes the render context its cells claim an
	// index from, and renders the same element with the same attributes — but holds a plain record
	// instead of constructing a Bond, a BondBinding, two capabilities and a registered Atom.
	//
	// It exists to put a number on the ceiling in `row-bench.ts`: `full - cells` says what the row's
	// machinery costs, and `full - lite` says how much of that is actually recoverable. What it
	// deliberately does NOT reproduce is the public surface — `{ row }` as a snippet argument,
	// `getBond`, `DataGridRowBond` as a constructible export — which is the whole reason this is a
	// prototype and not a patch.
	import { DataGridBond, type IDataGridRow } from '$ixirjs/ui/components/datagrid/bond.svelte';
	import { setDatagridRowRenderContext } from '$ixirjs/ui/components/datagrid/context';
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';

	let { value, children }: { value: string; children?: Snippet } = $props();

	const grid = DataGridBond.getOrThrow();

	let nextCellIndex = 0;
	setDatagridRowRenderContext({
		claimCellIndex: () => nextCellIndex++,
		datagrid: grid
	});

	// The record the grid indexes. `isSelected` stays a getter so selection remains reactive — the
	// point of the prototype is to drop the Bond, not the reactivity.
	const record: IDataGridRow = {
		get id() {
			return value;
		},
		get isSelected() {
			return grid.isSelected(value);
		},
		isHeader: false,
		get props() {
			return { value };
		}
	};

	// `untrack`ed for the reason `datagrid-row.svelte` untracks its own `bond.mount()`: registering
	// reads the collection, and a tracked read here would subscribe the mount to the signal it bumps.
	const unmount = untrack(() => grid.mountRow(record.id, record));
	$effect(() => unmount);

	const klass = $derived(
		'border-border datagrid-row items-center border-b bg-transparent ' +
			(record.isSelected
				? 'bg-primary/2 hover:bg-primary/4 active:bg-primary/6'
				: 'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100')
	);
</script>

<div class={klass} role="row" aria-selected={record.isSelected} style="--rows:auto">
	{@render children?.()}
</div>
