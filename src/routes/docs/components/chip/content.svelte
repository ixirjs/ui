<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { chipProps, chipCloseButtonProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'chip',
		title: 'Chip',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Chip', presetKey: 'chip', props: chipProps },
		{ label: 'ChipCloseButton', presetKey: 'chip.close', props: chipCloseButtonProps }
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
	next={{ label: 'Collapsible', href: '/docs/components/collapsible' }}
>
	{#snippet examples()}
		<DocExample
			title="Basic Chip"
			description="A dismissible chip with the default close button"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Filter Chips"
			description="A row of dismissible filter tags"
			{...ex('./examples/dismissible.svelte')}
		/>
	{/snippet}

	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
