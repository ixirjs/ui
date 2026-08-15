<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { radioProps, radioGroupProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Radio', presetKey: 'radio', props: radioProps },
		{ label: 'RadioGroup', props: radioGroupProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Radio"
			description="Single radio button"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Radio Group"
			description="Multiple radio buttons for single selection"
			{...ex('./examples/group.svelte')}
		/>

		<DocExample
			title="Disabled Radio"
			description="Radio button in disabled state"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
