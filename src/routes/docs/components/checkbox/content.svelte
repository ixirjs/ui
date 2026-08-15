<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { checkboxProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Checkbox', presetKey: 'checkbox', props: checkboxProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Checkbox"
			description="Simple checkbox with label"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Checkbox Group"
			description="Multiple checkboxes for multi-select"
			{...ex('./examples/group.svelte')}
		/>
		<DocExample
			title="Indeterminate State"
			description="Checkbox with indeterminate state for partial selection"
			{...ex('./examples/indeterminate.svelte')}
		/>
		<DocExample
			title="Disabled Checkbox"
			description="Checkbox in disabled state"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
