<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { chipProps, chipCloseButtonProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Chip', presetKey: 'chip', props: chipProps },
		{ label: 'ChipCloseButton', presetKey: 'chip.close', props: chipCloseButtonProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Chip"
			description="A dismissible chip with the default close button"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Filter Chips"
			description="A row of dismissible filter tags"
			{...ex('./examples/dismissible.svelte')}
		/>
	{/snippet}
</DocComponentPage>
