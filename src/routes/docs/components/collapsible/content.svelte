<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { collapsibleRootProps, collapsibleHeaderProps, collapsibleBodyProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'collapsible',
		title: 'Collapsible',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Collapsible.Root', presetKey: 'collapsible', props: collapsibleRootProps },
		{ label: 'Collapsible.Header', presetKey: 'collapsible.header', props: collapsibleHeaderProps },
		{ label: 'Collapsible.Body', presetKey: 'collapsible.body', props: collapsibleBodyProps }
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
	prev={{ label: 'Checkbox', href: '/docs/components/checkbox' }}
	next={{ label: 'Combobox', href: '/docs/components/combobox' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Collapsible"
			description="Simple collapsible section"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Controlled Collapsible"
			description="Externally controlled open state"
			{...ex('./examples/controlled.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
