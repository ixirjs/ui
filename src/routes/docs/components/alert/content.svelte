<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocCode, DocOnly } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		alertRootProps,
		alertIconProps,
		alertTitleProps,
		alertDescriptionProps,
		alertContentProps,
		alertCloseButtonProps,
		alertActionsProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Alert.Root', presetKey: 'alert', props: alertRootProps },
		{ label: 'Alert.Icon', presetKey: 'alert.icon', props: alertIconProps },
		{ label: 'Alert.Title', presetKey: 'alert.title', props: alertTitleProps },
		{ label: 'Alert.Description', presetKey: 'alert.description', props: alertDescriptionProps },
		{ label: 'Alert.Content', presetKey: 'alert.content', props: alertContentProps },
		{ label: 'Alert.CloseButton', presetKey: 'alert.close', props: alertCloseButtonProps },
		{ label: 'Alert.Actions', presetKey: 'alert.actions', props: alertActionsProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet preset()}
		<DocCode lang="typescript" code={metadata.presetCode} />
		<DocOnly for="markdown">
			**Available Preset Keys:** `alert`, `alert.icon`, `alert.title`, `alert.description`,
			`alert.content`, `alert.actions`, `alert.close`
		</DocOnly>
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Alert"
			description="Simple alert with icon and title"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Alert Variants"
			description="Different alert styles for various contexts"
			{...ex('./examples/variants.svelte')}
		/>

		<DocExample
			title="Dismissible Alert"
			description="Alert with close button"
			{...ex('./examples/dismissible.svelte')}
		/>

		<DocExample
			title="Alert with Actions"
			description="Alert with action buttons"
			{...ex('./examples/actions.svelte')}
		/>
	{/snippet}
</DocComponentPage>
