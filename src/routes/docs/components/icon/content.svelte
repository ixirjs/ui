<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { iconProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [{ label: 'Icon', presetKey: 'icon', props: iconProps }];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Icon"
			description="Pair an icon with a label at a size the preset controls."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
