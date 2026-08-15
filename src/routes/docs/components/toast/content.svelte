<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { toastRootProps, toastTitleProps, toastDescriptionProps, toastCloseProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Toast.Root', presetKey: 'toast', props: toastRootProps },
		{ label: 'Toast.Title', presetKey: 'toast.title', props: toastTitleProps },
		{ label: 'Toast.Description', presetKey: 'toast.description', props: toastDescriptionProps },
		{ label: 'Toast.Close', presetKey: 'toast.close', props: toastCloseProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
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
</DocComponentPage>
