<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { htmlElementProps, svgElementProps, htmlElementEventProps, elementProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'HtmlElement', presetKey: 'element', props: htmlElementProps },
		{ label: 'SvgElement', presetKey: 'element', props: svgElementProps },
		{ label: 'Element events', presetKey: 'element', props: htmlElementEventProps },
		{ label: 'Shared element props', presetKey: 'element', props: elementProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Element"
			description="Build a part that needs a raw element with motion but no atom."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
