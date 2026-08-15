<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		stepperRootProps,
		stepperHeaderProps,
		stepperBodyProps,
		stepperContentProps,
		stepperFooterProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Stepper.Root', presetKey: 'stepper', props: stepperRootProps },
		{ label: 'Stepper.Header', presetKey: 'stepper.header', props: stepperHeaderProps },
		{ label: 'Stepper.Body', presetKey: 'stepper.body', props: stepperBodyProps },
		{ label: 'Stepper.Content', presetKey: 'stepper.content', props: stepperContentProps },
		{ label: 'Stepper.Footer', presetKey: 'stepper.footer', props: stepperFooterProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Stepper"
			description="Navigate through steps with Previous / Next controls."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Non-linear navigation"
			description="Without `linear`, every step header is reachable directly."
			{...ex('./examples/non-linear.svelte')}
		/>
	{/snippet}
</DocComponentPage>
