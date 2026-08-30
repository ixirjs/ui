<script module lang="ts">
	// What a DataGrid row's Bond actually costs, decomposed.
	//
	// `docs/research/perf-vs-shadcn-2026-08.md` §13 estimates "one Bond root per row, ~11-12 µs of
	// the ~16" from the cost model (a root at 4.36 µs plus rich-lane elements), not from a
	// measurement. That estimate is the stated justification for a public-surface redesign, so it
	// is worth measuring before anyone acts on it.
	//
	// Three arms over the same three-cell row, all inside a real grid so the Bond context exists
	// and the Root/Body constants cancel in the slope:
	//
	//   full      DataGrid.Row (Bond, two capabilities, a registered Atom, two context publishes,
	//             a rich-lane element) wrapping three DataGrid.Cells
	//   cells     a hand-written <div> carrying the row's rendered attributes, wrapping the same
	//             three DataGrid.Cells — so `full - cells` IS the row Bond and its element
	//   floor     the same <div> wrapping three hand-written cell <div>s — so `cells - floor` is
	//             what three cells cost, and `floor` is the markup with no machinery at all
	//
	// The arms are deliberately NOT byte-equivalent: the point is what the machinery emits that
	// hand-written markup does not. The harness prints bytes so that difference stays visible
	// rather than being read as free.
	//   lite      a PROTOTYPE row that registers a plain record with the grid instead of being a
	//             Bond root, wrapping the same three DataGrid.Cells — so `full - lite` is what the
	//             redesign in §13 could actually recover, as against `full - cells`, which is only
	//             its ceiling
	export type RowArm = 'full' | 'lite' | 'cells' | 'floor';
</script>

<script lang="ts">
	import { DataGrid } from '$ixirjs/ui/components/datagrid';
	import RowLite from './row-lite.test.svelte';

	let { arm = 'full', n = 100 }: { arm?: RowArm; n?: number } = $props();

	// The row's own rendered class, copied from `datagrid-row.svelte` so the floor pays the same
	// string cost the real row does. A shorter literal here would flatter the floor.
	const ROW_CLASS =
		'border-border datagrid-row items-center border-b bg-transparent ' +
		'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100';
	const CELL_CLASS = 'border-border flex h-full items-center py-2 text-left';
</script>

<DataGrid.Root>
	<DataGrid.Body>
		{#each { length: n } as _, i (i)}
			{#if arm === 'full'}
				<DataGrid.Row value={String(i)}>
					<DataGrid.Cell>Name {i}</DataGrid.Cell>
					<DataGrid.Cell>Email {i}</DataGrid.Cell>
					<DataGrid.Cell>Role {i}</DataGrid.Cell>
				</DataGrid.Row>
			{:else if arm === 'lite'}
				<RowLite value={String(i)}>
					<DataGrid.Cell>Name {i}</DataGrid.Cell>
					<DataGrid.Cell>Email {i}</DataGrid.Cell>
					<DataGrid.Cell>Role {i}</DataGrid.Cell>
				</RowLite>
			{:else if arm === 'cells'}
				<div class={ROW_CLASS} role="row" aria-selected="false" style="--rows:auto">
					<DataGrid.Cell>Name {i}</DataGrid.Cell>
					<DataGrid.Cell>Email {i}</DataGrid.Cell>
					<DataGrid.Cell>Role {i}</DataGrid.Cell>
				</div>
			{:else}
				<div class={ROW_CLASS} role="row" aria-selected="false" style="--rows:auto">
					<div class={CELL_CLASS} role="gridcell">Name {i}</div>
					<div class={CELL_CLASS} role="gridcell">Email {i}</div>
					<div class={CELL_CLASS} role="gridcell">Role {i}</div>
				</div>
			{/if}
		{/each}
	</DataGrid.Body>
</DataGrid.Root>
