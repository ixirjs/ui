<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { tooltipRootProps, tooltipTriggerProps, tooltipContentProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'tooltip',
		title: 'Tooltip',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Tooltip.Root', props: tooltipRootProps },
		{ label: 'Tooltip.Trigger', props: tooltipTriggerProps },
		{ label: 'Tooltip.Content', props: tooltipContentProps }
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
	prev={{ label: 'Toast', href: '/docs/components/toast' }}
	next={{ label: 'Tree', href: '/docs/components/tree' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Tooltip"
			description="Simple tooltip shown on hover."
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Tooltip Placement"
			description="Tooltips positioned on different sides."
			{...ex('./examples/placement.svelte')}
		/>
		<DocExample
			title="Tooltip with Arrow"
			description="Tooltip with a directional arrow pointing at the trigger."
			{...ex('./examples/arrow.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
