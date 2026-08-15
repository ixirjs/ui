<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		scrollableRootProps,
		scrollableContainerProps,
		scrollableContentProps,
		scrollableTrackProps,
		scrollableThumbProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Scrollable.Root', presetKey: 'scrollable', props: scrollableRootProps },
		{
			label: 'Scrollable.Container',
			presetKey: 'scrollable.container',
			props: scrollableContainerProps
		},
		{ label: 'Scrollable.Content', presetKey: 'scrollable.content', props: scrollableContentProps },
		{ label: 'Scrollable.Track', presetKey: 'scrollable.track', props: scrollableTrackProps },
		{ label: 'Scrollable.Thumb', presetKey: 'scrollable.thumb', props: scrollableThumbProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Vertical Scrollable"
			description="Custom scrollbar for vertical scrolling"
			{...ex('./examples/vertical.svelte')}
		/>

		<DocExample
			title="Horizontal Scrollable"
			description="Custom scrollbar for horizontal scrolling"
			{...ex('./examples/horizontal.svelte')}
		/>
	{/snippet}
</DocComponentPage>
