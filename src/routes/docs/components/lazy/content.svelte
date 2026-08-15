<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { lazyProps, lazyOwnProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Lazy', presetKey: 'lazy', props: lazyProps },
		{ label: 'Lazy own props', presetKey: 'lazy', props: lazyOwnProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Lazy"
			description="Keep a heavy chart or editor out of the initial bundle."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
