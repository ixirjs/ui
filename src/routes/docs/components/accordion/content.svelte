<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		accordionRootProps,
		accordionItemRootProps,
		accordionItemHeaderProps,
		accordionItemBodyProps,
		accordionItemIndicatorProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Accordion.Root', presetKey: 'accordion', props: accordionRootProps },
		{ label: 'AccordionItem.Root', presetKey: 'accordion.item', props: accordionItemRootProps },
		{
			label: 'AccordionItem.Header',
			presetKey: 'accordion.item.header',
			props: accordionItemHeaderProps
		},
		{
			label: 'AccordionItem.Body',
			presetKey: 'accordion.item.body',
			props: accordionItemBodyProps
		},
		{
			label: 'AccordionItem.Indicator',
			presetKey: 'accordion.item.indicator',
			props: accordionItemIndicatorProps
		}
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Accordion"
			description="Simple accordion with collapsible sections"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Collapsible Accordion"
			description="All items can be collapsed simultaneously"
			{...ex('./examples/collapsible.svelte')}
		/>
		<DocExample
			title="Multiple Mode"
			description="Allow multiple sections to be open at once"
			{...ex('./examples/multiple.svelte')}
		/>
	{/snippet}
</DocComponentPage>
