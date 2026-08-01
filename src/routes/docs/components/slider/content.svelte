<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { sliderProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'slider',
		title: 'Slider',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{
			label: 'Slider',
			presetKey: 'slider / slider.track / slider.fill / slider.thumb',
			props: sliderProps
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
	prev={{ label: 'Sidebar', href: '/docs/components/sidebar' }}
	next={{ label: 'Stack', href: '/docs/components/stack' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Slider"
			description="Horizontal single-value slider with live binding"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Custom Range"
			description="Slider with negative and decimal step values"
			{...ex('./examples/range.svelte')}
		/>
		<DocExample
			title="Vertical Slider"
			description="Vertical orientation for compact control rails"
			{...ex('./examples/vertical.svelte')}
		/>
		<DocExample
			title="Custom Thumb and Track"
			description="Render custom snippets for thumb and track visuals"
			{...ex('./examples/custom.svelte')}
		/>
		<DocExample
			title="Disabled Slider"
			description="Non-interactive slider for locked or unavailable settings"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
