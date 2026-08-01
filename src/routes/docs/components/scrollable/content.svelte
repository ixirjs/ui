<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		scrollableRootProps,
		scrollableContainerProps,
		scrollableContentProps,
		scrollableTrackProps,
		scrollableThumbProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'scrollable',
		title: 'Scrollable',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Scrollable.Root', presetKey: 'scrollable', props: scrollableRootProps },
		{
			label: 'Scrollable.Container',
			presetKey: 'scrollable.container',
			props: scrollableContainerProps
		},
		{ label: 'Scrollable.Content', presetKey: 'scrollable.content', props: scrollableContentProps },
		{ label: 'Scrollable.Track', presetKey: 'scrollable.track', props: scrollableTrackProps },
		{ label: 'Scrollable.Thumb', presetKey: 'scrollable.thumb', props: scrollableThumbProps }
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
	prev={{ label: 'Radio', href: '/docs/components/radio' }}
	next={{ label: 'Select', href: '/docs/components/select' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Vertical Scrollable"
			description="Custom scrollbar for vertical scrolling"
			{...ex('./examples/vertical.svelte')}
		/>

		<DocExample
			title="Horizontal Scrollable"
			description="Custom scrollbar for horizontal scrolling"
			{...ex('./examples/horizontal.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
