<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { toastRootProps, toastTitleProps, toastDescriptionProps, toastCloseProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'toast',
		title: 'Toast',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Toast.Root', presetKey: 'toast', props: toastRootProps },
		{ label: 'Toast.Title', presetKey: 'toast.title', props: toastTitleProps },
		{ label: 'Toast.Description', presetKey: 'toast.description', props: toastDescriptionProps },
		{ label: 'Toast.Close', presetKey: 'toast.close', props: toastCloseProps }
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
	prev={{ label: 'Textarea', href: '/docs/components/textarea' }}
	next={{ label: 'Tooltip', href: '/docs/components/tooltip' }}
>
	{#snippet examples()}
		<DocExample
			title="Toast Variants"
			description="Trigger different toast types using the Toaster manager."
			{...ex('./examples/variants.svelte')}
		/>
		<DocExample
			title="Declarative"
			description="Toast.Root owned entirely by markup — no manager required."
			{...ex('./examples/declarative.svelte')}
		/>
		<DocExample
			title="Auto-dismiss"
			description="Pass duration to auto-close after the given number of milliseconds."
			{...ex('./examples/auto-dismiss.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
