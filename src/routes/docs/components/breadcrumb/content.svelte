<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import breadcrumbProps from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'breadcrumb',
		title: 'Breadcrumb',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Breadcrumb.Root', presetKey: 'breadcrumb', props: breadcrumbProps.root },
		{ label: 'Breadcrumb.Item', presetKey: 'breadcrumb.item', props: breadcrumbProps.item },
		{
			label: 'Breadcrumb.Separator',
			presetKey: 'breadcrumb.separator',
			props: breadcrumbProps.separator
		}
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
	prev={{ label: 'Badge', href: '/docs/components/badge' }}
	next={{ label: 'Button', href: '/docs/components/button' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Breadcrumb"
			description="Simple breadcrumb navigation"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Custom Separator"
			description="Use custom separator between items"
			{...ex('./examples/custom-separator.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
