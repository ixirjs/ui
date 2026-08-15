<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		datagridRootProps,
		datagridHeaderProps,
		datagridBodyProps,
		datagridFooterProps,
		datagridRowProps,
		datagridColumnProps,
		datagridCellProps,
		datagridCheckboxProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'DataGrid.Root', presetKey: 'datagrid', props: datagridRootProps },
		{ label: 'DataGrid.Header', presetKey: 'datagrid.header', props: datagridHeaderProps },
		{ label: 'DataGrid.Body', presetKey: 'datagrid.body', props: datagridBodyProps },
		{ label: 'DataGrid.Footer', presetKey: 'datagrid.footer', props: datagridFooterProps },
		{ label: 'DataGrid.Row', presetKey: 'datagrid.row', props: datagridRowProps },
		{ label: 'DataGrid.Column', presetKey: 'datagrid.column', props: datagridColumnProps },
		{ label: 'DataGrid.Cell', presetKey: 'datagrid.cell', props: datagridCellProps },
		{ label: 'DataGrid.Checkbox', presetKey: 'datagrid.checkbox', props: datagridCheckboxProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic DataGrid"
			description="Simple data grid with header and rows"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Selectable Rows"
			description="DataGrid with row selection via checkboxes"
			{...ex('./examples/selectable.svelte')}
		/>

		<DocExample
			title="Sortable Columns"
			description="Sort from a click or Enter/Space; the grid holds one sort and projects aria-sort"
			{...ex('./examples/sortable.svelte')}
		/>

		<DocExample
			title="Paginated"
			description="Compose the standalone Pagination family into the grid footer"
			{...ex('./examples/paginated.svelte')}
		/>

		<DocExample
			title="Row-Spanning Side Column"
			description="Create a vertical side rail that spans all body rows while preserving subgrid alignment"
			{...ex('./examples/row-spanning-column.svelte')}
		/>
	{/snippet}
</DocComponentPage>
