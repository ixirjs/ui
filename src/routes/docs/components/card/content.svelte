<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { cardRootProps, cardHeaderProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Card.Root', presetKey: 'card', props: cardRootProps },
		{
			label: 'Card Sub-Parts',
			presetKey: 'card.header / card.body / card.footer / …',
			props: cardHeaderProps
		}
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Card"
			description="Simple card with header, body, and footer"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Card with Media"
			description="Card with image/media section"
			{...ex('./examples/with-media.svelte')}
		/>
		<DocExample
			title="Clickable Card"
			description="Interactive card with click handler"
			{...ex('./examples/clickable.svelte')}
		/>
	{/snippet}
</DocComponentPage>
