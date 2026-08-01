<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { dropdownMenuItemProps, dropdownMenuListProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'dropdown-menu',
		title: 'Dropdown Menu',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'DropdownMenu.Root', presetKey: 'dropdown-menu', props: dropdownMenuListProps },
		{ label: 'DropdownMenu.Item', presetKey: 'dropdown-menu.item', props: dropdownMenuItemProps }
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
	prev={{ label: 'Drawer', href: '/docs/components/drawer' }}
	next={{ label: 'Form', href: '/docs/components/form' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Dropdown Menu"
			description="Simple menu with navigation items"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Interactive Menu"
			description="Menu items with click handlers"
			{...ex('./examples/interactive.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
