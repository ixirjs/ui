<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		listRootProps,
		listGroupProps,
		listItemProps,
		listTitleProps,
		listDividerProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'List.Root', presetKey: 'list', props: listRootProps },
		{ label: 'List.Group', presetKey: 'list.group', props: listGroupProps },
		{ label: 'List.Item', presetKey: 'list.item', props: listItemProps },
		{ label: 'List.Title', presetKey: 'list.title', props: listTitleProps },
		{ label: 'List.Divider', presetKey: 'list.divider', props: listDividerProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic List"
			description="Simple list with items"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="List with Groups"
			description="List with section groups and titles"
			{...ex('./examples/grouped.svelte')}
		/>

		<DocExample
			title="Clickable List"
			description="Interactive list items with click handlers"
			{...ex('./examples/clickable.svelte')}
		/>
	{/snippet}
</DocComponentPage>
