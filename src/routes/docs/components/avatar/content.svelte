<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { avatarProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'avatar',
		title: 'Avatar',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Avatar', presetKey: 'avatar', props: avatarProps }
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
	prev={{ label: 'Atom', href: '/docs/components/atom' }}
	next={{ label: 'Badge', href: '/docs/components/badge' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Avatar"
			description="Simple avatar with image"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Avatar Sizes"
			description="Different sizes for various contexts"
			{...ex('./examples/sizes.svelte')}
		/>
		<DocExample
			title="Fallback Initials"
			description="Automatic initials when no image is provided"
			{...ex('./examples/fallback.svelte')}
		/>
		<DocExample
			title="Avatar Group"
			description="Display multiple avatars in a group"
			{...ex('./examples/group.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
