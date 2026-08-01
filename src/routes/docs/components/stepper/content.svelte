<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		stepperRootProps,
		stepperHeaderProps,
		stepperBodyProps,
		stepperContentProps,
		stepperFooterProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'stepper',
		title: 'Stepper',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Stepper.Root', presetKey: 'stepper', props: stepperRootProps },
		{ label: 'Stepper.Header', presetKey: 'stepper.header', props: stepperHeaderProps },
		{ label: 'Stepper.Body', presetKey: 'stepper.body', props: stepperBodyProps },
		{ label: 'Stepper.Content', presetKey: 'stepper.content', props: stepperContentProps },
		{ label: 'Stepper.Footer', presetKey: 'stepper.footer', props: stepperFooterProps }
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
	prev={{ label: 'Stack', href: '/docs/components/stack' }}
	next={{ label: 'Swatch', href: '/docs/components/swatch' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Stepper"
			description="Navigate through steps with Previous / Next controls."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
