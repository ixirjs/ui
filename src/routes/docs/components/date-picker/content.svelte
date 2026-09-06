<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { datePickerRootProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'DatePicker.Root', presetKey: 'datepicker', props: datePickerRootProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic DatePicker"
			description="Single-date selection bound to a trigger"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Range Selection"
			description="Pick a start and end date"
			{...ex('./examples/range.svelte')}
		/>
	{/snippet}
	{#snippet extra()}
		<DocSection title="State and customization">
			<code>DatePicker.Root</code> owns the canonical <code>date-picker</code> profile. Its
			<code>children</code> snippet receives <code>datePicker</code>, typed as the
			<code>DatePickerBond</code> interface. Use bindable props and Bond commands, not a constructor
			or <code>factory</code> prop. The root handles teardown; see the
			<a href="/docs/migration">popup migration notes</a> for standalone authoring.
		</DocSection>
	{/snippet}
</DocComponentPage>
