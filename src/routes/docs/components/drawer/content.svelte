<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		slideoverRootProps,
		slideoverContentProps,
		slideoverHeaderProps,
		drawerBodyProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'drawer',
		title: 'Drawer',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Drawer.Root', presetKey: 'drawer', props: slideoverRootProps },
		{ label: 'Drawer.Content', presetKey: 'drawer.content', props: slideoverContentProps },
		{ label: 'Drawer.Header', presetKey: 'drawer.header', props: slideoverHeaderProps },
		{ label: 'Drawer.Body', presetKey: 'drawer.body', props: drawerBodyProps }
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
	prev={{ label: 'Divider', href: '/docs/components/divider' }}
	next={{ label: 'Dropdown Menu', href: '/docs/components/dropdown-menu' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Notifications Drawer"
			description="Right-side drawer showing a notification list."
			{...ex('./examples/notifications.svelte')}
		/>

		<DocExample
			title="Navigation Drawer"
			description="Left-side drawer used as a mobile nav menu."
			{...ex('./examples/navigation.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
