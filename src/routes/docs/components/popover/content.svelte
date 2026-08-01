<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		popoverRootProps,
		popoverContentProps,
		popoverIndicatorProps,
		popoverArrowProps,
		popoverTriggerProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'popover',
		title: 'Popover',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Popover.Root', presetKey: 'popover', props: popoverRootProps },
		{ label: 'Popover.Trigger', props: popoverTriggerProps },
		{ label: 'Popover.Content', presetKey: 'popover.content', props: popoverContentProps },
		{ label: 'Popover.Arrow', presetKey: 'popover.arrow', props: popoverArrowProps },
		{ label: 'Popover.Indicator', presetKey: 'popover.indicator', props: popoverIndicatorProps }
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
	prev={{ label: 'List', href: '/docs/components/list' }}
	next={{ label: 'Progress', href: '/docs/components/progress' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Popover"
			description="Simple popover with button trigger"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Popover with Arrow"
			description="Popover with directional arrow indicator"
			{...ex('./examples/arrow.svelte')}
		/>

		<DocExample
			title="Popover Placement"
			description="Control popover position relative to trigger"
			{...ex('./examples/placement.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
