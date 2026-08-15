<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { stackRootProps, stackItemProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Stack.Root', presetKey: 'stack', props: stackRootProps },
		{ label: 'Stack.Item', presetKey: 'stack.item', props: stackItemProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Vertical Stack"
			description="Items stacked vertically (default)"
			{...ex('./examples/vertical.svelte')}
		/>
		<DocExample
			title="Horizontal Stack"
			description="Items arranged horizontally"
			{...ex('./examples/horizontal.svelte')}
		/>
		<DocExample
			title="Grid Stack"
			description="Items arranged in a grid"
			{...ex('./examples/grid.svelte')}
		/>
	{/snippet}
</DocComponentPage>
