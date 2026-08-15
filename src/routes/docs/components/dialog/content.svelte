<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		dialogProps,
		dialogContentProps,
		dialogHeaderProps,
		dialogBodyProps,
		dialogFooterProps,
		dialogTitleProps,
		dialogDescriptionProps,
		dialogCloseButtonProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Dialog.Root', presetKey: 'dialog', props: dialogProps },
		{ label: 'Dialog.Content', presetKey: 'dialog.content', props: dialogContentProps },
		{ label: 'Dialog.Header', presetKey: 'dialog.header', props: dialogHeaderProps },
		{ label: 'Dialog.Body', presetKey: 'dialog.body', props: dialogBodyProps },
		{ label: 'Dialog.Footer', presetKey: 'dialog.footer', props: dialogFooterProps },
		{ label: 'Dialog.Title', presetKey: 'dialog.title', props: dialogTitleProps },
		{ label: 'Dialog.Description', presetKey: 'dialog.description', props: dialogDescriptionProps },
		{ label: 'Dialog.CloseButton', presetKey: 'dialog.close', props: dialogCloseButtonProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Dialog"
			description="Modal dialog with a trigger button — no manual open state needed."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Destructive Action"
			description="Confirmation dialog for irreversible actions."
			{...ex('./examples/destructive.svelte')}
		/>
	{/snippet}

	{#snippet extra()}
		<DocSection title="Portal containment">
			Dialog content resolves its target in this order: an explicit <code>portal</code>, the ambient
			portal supplied by its host, then <code>root.l0</code>. Nested overlays therefore remain
			scoped to the dialog's host instead of detaching to <code>document.body</code>.
		</DocSection>
	{/snippet}
</DocComponentPage>
