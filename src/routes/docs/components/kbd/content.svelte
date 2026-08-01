<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { kbdProps, shortcutProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'kbd',
		title: 'Kbd',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Kbd', presetKey: 'kbd', props: kbdProps },
		{ label: 'Shortcut', props: shortcutProps }
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
	prev={{ label: 'Input', href: '/docs/components/input' }}
	next={{ label: 'Label', href: '/docs/components/label' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Individual Keys"
			description="Use Kbd to represent a single keyboard key."
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Shortcut — keys prop"
			description="Pass an array of keys to render a key combination."
			{...ex('./examples/shortcut-keys.svelte')}
		/>
		<DocExample
			title="Custom Separator"
			description="Override the default '+' separator with any string."
			{...ex('./examples/custom-separator.svelte')}
		/>
		<DocExample
			title="Manual Composition"
			description="Use the children slot for full control over the shortcut layout."
			{...ex('./examples/manual-composition.svelte')}
		/>
		<DocExample
			title="Inline Usage"
			description="Kbd and Shortcut can be embedded directly within prose text."
			{...ex('./examples/inline.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
