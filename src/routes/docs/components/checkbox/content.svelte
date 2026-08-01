<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { checkboxProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'checkbox',
		title: 'Checkbox',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Checkbox', presetKey: 'checkbox', props: checkboxProps }
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
	prev={{ label: 'Card', href: '/docs/components/card' }}
	next={{ label: 'Chip', href: '/docs/components/chip' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Checkbox"
			description="Simple checkbox with label"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Checkbox Group"
			description="Multiple checkboxes for multi-select"
			{...ex('./examples/group.svelte')}
		/>
		<DocExample
			title="Indeterminate State"
			description="Checkbox with indeterminate state for partial selection"
			{...ex('./examples/indeterminate.svelte')}
		/>
		<DocExample
			title="Disabled Checkbox"
			description="Checkbox in disabled state"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
