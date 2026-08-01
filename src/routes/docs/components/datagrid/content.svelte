<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		datagridRootProps,
		datagridHeaderProps,
		datagridBodyProps,
		datagridFooterProps,
		datagridTrProps,
		datagridThProps,
		datagridTdProps,
		datagridCheckboxProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'datagrid',
		title: 'DataGrid',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'DataGrid.Root', presetKey: 'datagrid', props: datagridRootProps },
		{ label: 'DataGrid.Header', presetKey: 'datagrid.header', props: datagridHeaderProps },
		{ label: 'DataGrid.Body', presetKey: 'datagrid.body', props: datagridBodyProps },
		{ label: 'DataGrid.Footer', presetKey: 'datagrid.footer', props: datagridFooterProps },
		{ label: 'DataGrid.Row', presetKey: 'datagrid.row', props: datagridTrProps },
		{ label: 'DataGrid.Column', presetKey: 'datagrid.column', props: datagridThProps },
		{ label: 'DataGrid.Cell', presetKey: 'datagrid.cell', props: datagridTdProps },
		{ label: 'DataGrid.Checkbox', presetKey: 'datagrid.checkbox', props: datagridCheckboxProps }
	];

	const _loaders = import.meta.glob('./examples/*.svelte');
	const _sources = import.meta.glob('./examples/*.svelte', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;
	const ex = createExampleLoader(_loaders, _sources);
</script>

<DocComponentPage
	{contentType}
	{metadata}
	{frontmatter}
	prev={{ label: 'DatePicker', href: '/docs/components/date-picker' }}
	next={{ label: 'Dialog', href: '/docs/components/dialog' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

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
			description="DataGrid with click-to-sort column headers"
			{...ex('./examples/sortable.svelte')}
		/>

		<DocExample
			title="Row-Spanning Side Column"
			description="Create a vertical side rail that spans all body rows while preserving subgrid alignment"
			{...ex('./examples/row-spanning-column.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
