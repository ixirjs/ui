<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { dividerProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Divider', presetKey: 'divider', props: dividerProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Horizontal Divider"
			description="Default horizontal separator"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Vertical Divider"
			description="Vertical separator for inline content"
			{...ex('./examples/orientation.svelte')}
		/>
		<DocExample
			title="Labeled Divider"
			description="Divider with center label"
			{...ex('./examples/label.svelte')}
		/>
	{/snippet}
</DocComponentPage>
