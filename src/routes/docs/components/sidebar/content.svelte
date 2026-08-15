<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { sidebarRootProps, sidebarContentProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Sidebar.Root', presetKey: 'sidebar', props: sidebarRootProps },
		{ label: 'Sidebar.Content', presetKey: 'sidebar.content', props: sidebarContentProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Sidebar"
			description="Collapsible sidebar with icon + text navigation. Collapses to icon-only mode."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Trailing edge and commit callback"
			description="An inspector panel on the right, with `onopenchange` firing after the transition commits."
			{...ex('./examples/right-side.svelte')}
		/>
	{/snippet}
</DocComponentPage>
