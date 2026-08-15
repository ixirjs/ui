<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { switchProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Switch', presetKey: 'switch', props: switchProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Switch"
			description="Toggle a preference that applies immediately, with no save step."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
