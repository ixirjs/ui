<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		selectRootProps,
		selectItemProps,
		selectTriggerProps,
		selectSelectionsProps,
		selectSelectionProps,
		selectQueryProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'select',
		title: 'Select',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Select.Root', presetKey: 'select', props: selectRootProps },
		{ label: 'Select.Trigger', props: selectTriggerProps },
		{ label: 'Select.Item', presetKey: 'select.item', props: selectItemProps },
		{ label: 'Select.Selections', props: selectSelectionsProps },
		{ label: 'Select.Selection', props: selectSelectionProps },
		{ label: 'Select.Query', props: selectQueryProps }
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
	prev={{ label: 'Scrollable', href: '/docs/components/scrollable' }}
	next={{ label: 'Sidebar', href: '/docs/components/sidebar' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Select"
			description="Simple dropdown select"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Multiple Select"
			description="Select with multiple value support"
			{...ex('./examples/multiple.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
