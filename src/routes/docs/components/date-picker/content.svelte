<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { datePickerRootProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'DatePicker.Root', presetKey: 'date-picker', props: datePickerRootProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic DatePicker"
			description="Single-date selection bound to a trigger"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Range Selection"
			description="Pick a start and end date"
			{...ex('./examples/range.svelte')}
		/>
	{/snippet}
</DocComponentPage>
