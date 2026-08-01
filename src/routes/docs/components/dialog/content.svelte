<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		dialogProps,
		dialogContentProps,
		dialogHeaderProps,
		dialogBodyProps,
		dialogFooterProps,
		dialogTitleProps,
		dialogDescriptionProps,
		dialogCloseButtonProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'dialog',
		title: 'Dialog',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Dialog.Root', presetKey: 'dialog', props: dialogProps },
		{ label: 'Dialog.Content', presetKey: 'dialog.content', props: dialogContentProps },
		{ label: 'Dialog.Header', presetKey: 'dialog.header', props: dialogHeaderProps },
		{ label: 'Dialog.Body', presetKey: 'dialog.body', props: dialogBodyProps },
		{ label: 'Dialog.Footer', presetKey: 'dialog.footer', props: dialogFooterProps },
		{ label: 'Dialog.Title', presetKey: 'dialog.title', props: dialogTitleProps },
		{ label: 'Dialog.Description', presetKey: 'dialog.description', props: dialogDescriptionProps },
		{ label: 'Dialog.CloseButton', presetKey: 'dialog.close-button', props: dialogCloseButtonProps }
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
	prev={{ label: 'DataGrid', href: '/docs/components/datagrid' }}
	next={{ label: 'Divider', href: '/docs/components/divider' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Dialog"
			description="Modal dialog with a trigger button — no manual open state needed."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Destructive Action"
			description="Confirmation dialog for irreversible actions."
			{...ex('./examples/destructive.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
