<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { calendarRootProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Calendar.Root', presetKey: 'calendar', props: calendarRootProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Calendar"
			description="Single-date selection in a month grid"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Range Selection"
			description="Pick a start and end date"
			{...ex('./examples/range.svelte')}
		/>
	{/snippet}
</DocComponentPage>
