<script lang="ts">
	// The SHIPPED DataGrid, imported part by part. Four parts per row (row + three cells) means this
	// family multiplies the namespace cost harder than any other in the set — see `card-direct`.
	import DataGridRoot from '$ixirjs/ui/components/datagrid/datagrid-root.svelte';
	import DataGridBody from '$ixirjs/ui/components/datagrid/datagrid-body.svelte';
	import DataGridRow from '$ixirjs/ui/components/datagrid/row/datagrid-row.svelte';
	import DataGridCell from '$ixirjs/ui/components/datagrid/cell/datagrid-cell.svelte';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
	setPreset(defaultPreset);
</script>

<DataGridRoot>
	<DataGridBody>
		{#each { length: n } as _, i (i)}
			<DataGridRow value={String(i)} class={tint}>
				<DataGridCell>Name {i}</DataGridCell>
				<DataGridCell>Email {i}</DataGridCell>
				<DataGridCell>Role {i}</DataGridCell>
			</DataGridRow>
		{/each}
		<DataGridRow value="probe" class={bump}>
			<DataGridCell>Probe</DataGridCell>
			<DataGridCell>Probe</DataGridCell>
			<DataGridCell>Probe</DataGridCell>
		</DataGridRow>
	</DataGridBody>
</DataGridRoot>
