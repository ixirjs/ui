<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		comboboxRootProps,
		comboboxSelectionsProps,
		comboboxSelectionProps,
		comboboxControlProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Combobox.Root', presetKey: 'combobox', props: comboboxRootProps },
		{ label: 'Combobox.Control', presetKey: 'input.control', props: comboboxControlProps },
		{ label: 'Combobox.Selections', props: comboboxSelectionsProps },
		{ label: 'Combobox.Selection', props: comboboxSelectionProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Single Selection"
			description="Combobox for selecting a single value"
			{...ex('./examples/single.svelte')}
		/>

		<DocExample
			title="Multiple Selection"
			description="Combobox supporting multiple selected values"
			{...ex('./examples/multiple.svelte')}
		/>

		<DocExample
			title="Searchable / Filtered"
			description="Combobox with real-time search filtering"
			{...ex('./examples/filter.svelte')}
		/>
	{/snippet}
</DocComponentPage>
