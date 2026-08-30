<script lang="ts">
	// The collection axis, unwindowed on both sides — the apples-to-apples per-row cost. Scale with
	// windowing is a separate arm (`bench:vs-shadcn -- --scale`), because comparing 1000 rendered
	// rows against 20 rendered rows is a statement about the design, not about per-row cost.
	// One unit is one ROW of three cells.
	import { DataGrid } from '$ixirjs/ui/components/datagrid';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	// A real app installs the preset, and without one `klass()` answers from the memoised
	// fallback while shadcn runs `cn()` on every element — ~0.8 µs/part the head-to-head was not
	// charging us. perf-vs-shadcn-2026-08.md §17.
	setPreset(defaultPreset);
</script>

<DataGrid.Root>
	<DataGrid.Body>
		{#each { length: n } as _, i (i)}
			<DataGrid.Row value={String(i)} class={tint}>
				<DataGrid.Cell>Name {i}</DataGrid.Cell>
				<DataGrid.Cell>Email {i}</DataGrid.Cell>
				<DataGrid.Cell>Role {i}</DataGrid.Cell>
			</DataGrid.Row>
		{/each}
		<DataGrid.Row value="probe" class={bump}>
			<DataGrid.Cell>Probe</DataGrid.Cell>
			<DataGrid.Cell>Probe</DataGrid.Cell>
			<DataGrid.Cell>Probe</DataGrid.Cell>
		</DataGrid.Row>
	</DataGrid.Body>
</DataGrid.Root>
