<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { popoverDialogRootProps, popoverDialogContentProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'PopoverDialog.Root', presetKey: 'popover-dialog', props: popoverDialogRootProps },
		{
			label: 'PopoverDialog.Content',
			presetKey: 'popover-dialog.content',
			props: popoverDialogContentProps
		}
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic PopoverDialog"
			description="Popover trigger with a portalled, focus-managed modal presentation."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
	{#snippet extra()}
		<DocSection title="State and customization">
			<code>PopoverDialog.Root</code> owns the canonical <code>popover-dialog</code> profile. Its
			<code>children</code> snippet receives <code>popoverDialog</code>, typed as the
			<code>PopoverDialogBond</code> interface. Use bindable props and Bond commands, not a
			constructor or <code>factory</code> prop. The root handles teardown; see the
			<a href="/docs/migration">popup migration notes</a> for standalone authoring.
		</DocSection>
	{/snippet}
</DocComponentPage>
