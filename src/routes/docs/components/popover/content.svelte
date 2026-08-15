<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		popoverRootProps,
		popoverContentProps,
		popoverIndicatorProps,
		popoverTailProps,
		popoverTriggerProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Popover.Root', presetKey: 'popover', props: popoverRootProps },
		{ label: 'Popover.Trigger', props: popoverTriggerProps },
		{ label: 'Popover.Content', presetKey: 'popover.content', props: popoverContentProps },
		{ label: 'Popover.Tail', presetKey: 'popover.tail', props: popoverTailProps },
		{ label: 'Popover.Indicator', presetKey: 'popover.indicator', props: popoverIndicatorProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Popover"
			description="Simple popover with button trigger"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Popover with Tail"
			description="Popover with directional tail indicator"
			{...ex('./examples/tail.svelte')}
		/>

		<DocExample
			title="Popover Placement"
			description="Control popover position relative to trigger"
			{...ex('./examples/placement.svelte')}
		/>
	{/snippet}

	{#snippet extra()}
		<DocSection title="Portal containment">
			Popover content resolves an explicit <code>portal</code> first, then the ambient portal, then
			<code>root.l0</code>. A popover inside a dialog remains clipped, positioned, and stacked
			within that dialog's portal scope by default.
		</DocSection>
	{/snippet}
</DocComponentPage>
