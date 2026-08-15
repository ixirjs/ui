<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { sliderProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{
			label: 'Slider',
			presetKey: 'slider / slider.track / slider.fill / slider.thumb',
			props: sliderProps
		}
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Slider"
			description="Horizontal single-value slider with live binding"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Custom Range"
			description="Slider with negative and decimal step values"
			{...ex('./examples/range.svelte')}
		/>
		<DocExample
			title="Vertical Slider"
			description="Vertical orientation for compact control rails"
			{...ex('./examples/vertical.svelte')}
		/>
		<DocExample
			title="Custom Thumb and Track"
			description="Render custom snippets for thumb and track visuals"
			{...ex('./examples/custom.svelte')}
		/>
		<DocExample
			title="Disabled Slider"
			description="Non-interactive slider for locked or unavailable settings"
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
