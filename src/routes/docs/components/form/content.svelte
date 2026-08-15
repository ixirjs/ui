<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		formRootProps,
		fieldRootProps,
		fieldLabelProps,
		fieldControlProps,
		fieldHelperTextProps,
		fieldErrorProps
	} from './props';
	import { metadata } from './shared';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html', ex }: DocContentProps = $props();

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
		{ label: 'Field.HelperText', presetKey: 'field.helper-text', props: fieldHelperTextProps },
		{ label: 'Field.Error', presetKey: 'field.error', props: fieldErrorProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {frontmatter} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Form"
			description="Simple form with labeled fields."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Schema Validation"
			description="A Standard Schema on the form — Zod here, but Valibot or ArkType work unchanged. Errors are routed to the field whose name matches the issue path."
			{...ex('./examples/validated.svelte')}
		/>

		<DocExample
			title="Externally Owned Errors"
			description="Errors that come from outside the form — a server action, or Superforms' $errors store. No schema on the client."
			{...ex('./examples/external-errors.svelte')}
		/>
	{/snippet}
</DocComponentPage>
