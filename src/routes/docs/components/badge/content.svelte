<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { badgeProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [{ label: 'Badge', presetKey: 'badge', props: badgeProps }];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Badge"
			description="Simple badge component"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Badge Variants"
			description="Different styles for various contexts"
			{...ex('./examples/variants.svelte')}
		/>
		<DocExample
			title="Badge Sizes"
			description="Different sizes for various use cases"
			{...ex('./examples/sizes.svelte')}
		/>
	{/snippet}
</DocComponentPage>
