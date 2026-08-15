<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { tooltipRootProps, tooltipTriggerProps, tooltipContentProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Tooltip.Root', props: tooltipRootProps },
		{ label: 'Tooltip.Trigger', props: tooltipTriggerProps },
		{ label: 'Tooltip.Content', props: tooltipContentProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Tooltip"
			description="Simple tooltip shown on hover."
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Tooltip Placement"
			description="Tooltips positioned on different sides."
			{...ex('./examples/placement.svelte')}
		/>
		<DocExample
			title="Tooltip with Tail"
			description="Tooltip with a directional tail pointing at the trigger."
			{...ex('./examples/tail.svelte')}
		/>
	{/snippet}
</DocComponentPage>
