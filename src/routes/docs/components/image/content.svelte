<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { imageProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [{ label: 'Image', presetKey: 'image', props: imageProps }];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Image"
			description="A fixed aspect ratio and radius applied from one preset key."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
