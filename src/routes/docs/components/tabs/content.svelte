<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		tabsRootProps,
		tabHeaderProps,
		tabBodyProps,
		tabDescriptionProps,
		tabsHeaderProps,
		tabsBodyProps,
		tabsContentProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'tabs',
		title: 'Tabs',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Tabs.Root', props: tabsRootProps },
		{ label: 'Tabs.Header', props: tabsHeaderProps },
		{ label: 'Tabs.Body', props: tabsBodyProps },
		{ label: 'Tabs.Content', props: tabsContentProps },
		{ label: 'Tab.Header', props: tabHeaderProps },
		{ label: 'Tab.Body', props: tabBodyProps },
		{ label: 'Tab.Description', props: tabDescriptionProps }
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
	prev={{ label: 'Swatch', href: '/docs/components/swatch' }}
	next={{ label: 'Textarea', href: '/docs/components/textarea' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Tabs"
			description="Standard tabbed navigation."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
