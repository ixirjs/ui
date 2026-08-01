<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { stackRootProps, stackItemProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'stack',
		title: 'Stack',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Stack.Root', presetKey: 'stack', props: stackRootProps },
		{ label: 'Stack.Item', presetKey: 'stack.item', props: stackItemProps }
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
	prev={{ label: 'Slider', href: '/docs/components/slider' }}
	next={{ label: 'Stepper', href: '/docs/components/stepper' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Vertical Stack"
			description="Items stacked vertically (default)"
			{...ex('./examples/vertical.svelte')}
		/>
		<DocExample
			title="Horizontal Stack"
			description="Items arranged horizontally"
			{...ex('./examples/horizontal.svelte')}
		/>
		<DocExample
			title="Grid Stack"
			description="Items arranged in a grid"
			{...ex('./examples/grid.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
