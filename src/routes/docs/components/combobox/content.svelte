<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		comboboxRootProps,
		comboboxSelectionsProps,
		comboboxSelectionProps,
		comboboxControlProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'combobox',
		title: 'Combobox',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Combobox.Root', presetKey: 'combobox', props: comboboxRootProps },
		{ label: 'Combobox.Control', presetKey: 'input.control', props: comboboxControlProps },
		{ label: 'Combobox.Selections', props: comboboxSelectionsProps },
		{ label: 'Combobox.Selection', props: comboboxSelectionProps }
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
	prev={{ label: 'Collapsible', href: '/docs/components/collapsible' }}
	next={{ label: 'Context Menu', href: '/docs/components/context-menu' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Single Selection"
			description="Combobox for selecting a single value"
			{...ex('./examples/single.svelte')}
		/>

		<DocExample
			title="Multiple Selection"
			description="Combobox supporting multiple selected values"
			{...ex('./examples/multiple.svelte')}
		/>

		<DocExample
			title="Searchable / Filtered"
			description="Combobox with real-time search filtering"
			{...ex('./examples/filter.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
