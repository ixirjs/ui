<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { labelProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [{ label: 'Label', presetKey: 'label', props: labelProps }];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Label"
			description="Label associated with a form control"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Required Label"
			description="Label with required indicator"
			{...ex('./examples/required.svelte')}
		/>
		<DocExample
			title="Disabled Label"
			description="Label for a disabled control"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
