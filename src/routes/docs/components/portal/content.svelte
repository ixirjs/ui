<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { portalOuterProps, portalSurfaceProps, activePortalProps, teleportProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Portal.Outer', presetKey: 'portal', props: portalOuterProps },
		{ label: 'Portal surface', presetKey: 'portal', props: portalSurfaceProps },
		{ label: 'ActivePortal', presetKey: 'portal', props: activePortalProps },
		{ label: 'Teleport', presetKey: 'portal', props: teleportProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Portal"
			description="What Dialog, Drawer, Popover and Tooltip already render through."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
