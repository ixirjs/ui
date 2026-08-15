<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { treeRootProps, treeHeaderProps, treeBodyProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Tree.Root', presetKey: 'tree', props: treeRootProps },
		{ label: 'Tree.Header', presetKey: 'tree.header', props: treeHeaderProps },
		{ label: 'Tree.Body', presetKey: 'tree.body', props: treeBodyProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="File Tree"
			description="Nested Tree.Root components — each node is a Tree.Root with Header + Body."
			{...ex('./examples/file-tree.svelte')}
		/>

		<DocExample
			title="Recursive data"
			description="Render arbitrary depth from a data structure with one recursive snippet."
			{...ex('./examples/recursive.svelte')}
		/>
	{/snippet}
</DocComponentPage>
