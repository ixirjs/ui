<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { datePickerRootProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'date-picker',
		title: 'DatePicker',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'DatePicker.Root', presetKey: 'date-picker', props: datePickerRootProps }
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
	prev={{ label: 'Context Menu', href: '/docs/components/context-menu' }}
	next={{ label: 'DataGrid', href: '/docs/components/datagrid' }}
>
	{#snippet examples()}
		<DocExample
			title="Basic DatePicker"
			description="Single-date selection bound to a trigger"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Range Selection"
			description="Pick a start and end date"
			{...ex('./examples/range.svelte')}
		/>
	{/snippet}

	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
