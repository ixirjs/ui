<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { collapsibleRootProps, collapsibleHeaderProps, collapsibleBodyProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Collapsible.Root', presetKey: 'collapsible', props: collapsibleRootProps },
		{ label: 'Collapsible.Header', presetKey: 'collapsible.header', props: collapsibleHeaderProps },
		{ label: 'Collapsible.Body', presetKey: 'collapsible.body', props: collapsibleBodyProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Collapsible"
			description="Simple collapsible section"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Controlled Collapsible"
			description="Externally controlled open state"
			{...ex('./examples/controlled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
