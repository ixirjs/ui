<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { linkProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [{ label: 'Link', presetKey: 'link', props: linkProps }];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Link"
			description="Standard navigation link"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Link Variants"
			description="Different link visual styles"
			{...ex('./examples/variants.svelte')}
		/>
		<DocExample
			title="External Link"
			description="Link to an external resource"
			{...ex('./examples/external.svelte')}
		/>
	{/snippet}
</DocComponentPage>
