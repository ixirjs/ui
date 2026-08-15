<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { popoverDialogRootProps, popoverDialogContentProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'PopoverDialog.Root', presetKey: 'popover-dialog', props: popoverDialogRootProps },
		{
			label: 'PopoverDialog.Content',
			presetKey: 'popover-dialog.content',
			props: popoverDialogContentProps
		}
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic PopoverDialog"
			description="Anchored beside the trigger on desktop, full-height sheet on mobile."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
