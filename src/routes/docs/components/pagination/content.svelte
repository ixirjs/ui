<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { paginationRootProps, paginationPreviousProps, paginationNextProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Pagination.Root', presetKey: 'pagination', props: paginationRootProps },
		{
			label: 'Pagination.Previous',
			presetKey: 'pagination.previous',
			props: paginationPreviousProps
		},
		{ label: 'Pagination.Next', presetKey: 'pagination.next', props: paginationNextProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Pagination"
			description="Step through search or table results a page at a time."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
