<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		formRootProps,
		fieldRootProps,
		fieldLabelProps,
		fieldControlProps,
		fieldHelperTextProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'form',
		title: 'Form',
		category: 'components',
		depth: 'intermediate',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
		{ label: 'Form', presetKey: 'form', props: formRootProps },
		{ label: 'Field.Root', presetKey: 'field', props: fieldRootProps },
		{ label: 'Field.Label', presetKey: 'field.label', props: fieldLabelProps },
		{ label: 'Field.Control', presetKey: 'field.control', props: fieldControlProps },
		{ label: 'Field.HelperText', presetKey: 'field.helper-text', props: fieldHelperTextProps }
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
	prev={{ label: 'Dropdown Menu', href: '/docs/components/dropdown-menu' }}
	next={{ label: 'Input', href: '/docs/components/input' }}
>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Form"
			description="Simple form with labeled fields."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Form with Validation Errors"
			description="Field with inline error messages."
			{...ex('./examples/validated.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
