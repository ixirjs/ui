<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { textareaRootProps, textareaInputProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Textarea.Root', presetKey: 'textarea', props: textareaRootProps },
		{ label: 'Textarea.Input', presetKey: 'textarea.input', props: textareaInputProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Textarea"
			description="Multi-line text input"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Auto-resize Textarea"
			description="Textarea that grows with content"
			{...ex('./examples/auto-resize.svelte')}
		/>

		<DocExample
			title="Disabled Textarea"
			description="Textarea in disabled state"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
