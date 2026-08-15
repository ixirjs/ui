<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { kbdProps, shortcutProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Kbd', presetKey: 'kbd', props: kbdProps },
		{ label: 'Shortcut', props: shortcutProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Individual Keys"
			description="Use Kbd to represent a single keyboard key."
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Shortcut — keys prop"
			description="Pass an array of keys to render a key combination."
			{...ex('./examples/shortcut-keys.svelte')}
		/>
		<DocExample
			title="Custom Separator"
			description="Override the default '+' separator with any string."
			{...ex('./examples/custom-separator.svelte')}
		/>
		<DocExample
			title="Manual Composition"
			description="Use the children slot for full control over the shortcut layout."
			{...ex('./examples/manual-composition.svelte')}
		/>
		<DocExample
			title="Inline Usage"
			description="Kbd and Shortcut can be embedded directly within prose text."
			{...ex('./examples/inline.svelte')}
		/>
	{/snippet}
</DocComponentPage>
