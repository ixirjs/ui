<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		tabsRootProps,
		tabHeaderProps,
		tabBodyProps,
		tabDescriptionProps,
		tabsHeaderProps,
		tabsBodyProps,
		tabsContentProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Tabs.Root', props: tabsRootProps },
		{ label: 'Tabs.Header', props: tabsHeaderProps },
		{ label: 'Tabs.Body', props: tabsBodyProps },
		{ label: 'Tabs.Content', props: tabsContentProps },
		{ label: 'Tab.Header', props: tabHeaderProps },
		{ label: 'Tab.Body', props: tabBodyProps },
		{ label: 'Tab.Description', props: tabDescriptionProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Tabs"
			description="Standard tabbed navigation."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Controlled tabs"
			description="Drive the active tab from outside the tab list — a wizard, a route parameter, or a validation jump."
			{...ex('./examples/controlled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
