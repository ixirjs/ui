<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocOnly, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { alertRootProps, alertSubPartProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'alert',
		title: 'Alert',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Alert.Root', presetKey: 'alert', props: alertRootProps },
		{ label: 'Alert.Icon', presetKey: 'alert.icon', props: alertSubPartProps },
		{ label: 'Alert.Title', presetKey: 'alert.title', props: alertSubPartProps },
		{ label: 'Alert.Description', presetKey: 'alert.description', props: alertSubPartProps },
		{ label: 'Alert.Content', presetKey: 'alert.content', props: alertSubPartProps },
		{ label: 'Alert.CloseButton', presetKey: 'alert.close', props: alertSubPartProps },
		{ label: 'Alert.Actions', presetKey: 'alert.actions', props: alertSubPartProps }
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
	prev={{ label: 'Accordion', href: '/docs/components/accordion' }}
	next={{ label: 'Atom', href: '/docs/components/atom' }}
>
	{#snippet preset()}
		<DocCode lang="typescript" code={metadata.examples.preset} />
		<DocOnly for="markdown">
			**Available Preset Keys:** `alert`, `alert.icon`, `alert.title`, `alert.description`,
			`alert.content`, `alert.actions`, `alert.close`
		</DocOnly>
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Alert"
			description="Simple alert with icon and title"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Alert Variants"
			description="Different alert styles for various contexts"
			{...ex('./examples/variants.svelte')}
		/>

		<DocExample
			title="Dismissible Alert"
			description="Alert with close button"
			{...ex('./examples/dismissible.svelte')}
		/>

		<DocExample
			title="Alert with Actions"
			description="Alert with action buttons"
			{...ex('./examples/actions.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
