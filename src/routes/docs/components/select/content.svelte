<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		selectRootProps,
		selectItemProps,
		selectTriggerProps,
		selectSelectionsProps,
		selectSelectionProps,
		selectQueryProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Select.Root', presetKey: 'select', props: selectRootProps },
		{ label: 'Select.Trigger', props: selectTriggerProps },
		{ label: 'Select.Item', presetKey: 'select.item', props: selectItemProps },
		{ label: 'Select.Selections', props: selectSelectionsProps },
		{ label: 'Select.Selection', props: selectSelectionProps },
		{ label: 'Select.Query', props: selectQueryProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Select"
			description="Simple dropdown select"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Multiple Select"
			description="Select with multiple value support"
			{...ex('./examples/multiple.svelte')}
		/>
	{/snippet}
	{#snippet extra()}
		<DocSection title="State and customization">
			<code>Select.Root</code> owns the canonical <code>select</code> profile. Its
			<code>children</code> snippet receives <code>select</code>, typed as the
			<code>SelectBond</code> interface. Use bindable props and Bond commands, not a constructor or
			<code>factory</code>
			prop. The root handles teardown; see the
			<a href="/docs/migration">popup migration notes</a> for standalone authoring.
		</DocSection>
	{/snippet}
</DocComponentPage>
