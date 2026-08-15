<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocCode, DocOnly } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { buttonProps } from './props';
	import { metadata } from './shared';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const frontmatter: Frontmatter = {
		id: 'button',
		title: 'Button Component',
		category: 'components',
		depth: 'beginner',
		prerequisites: ['atoms', 'styling'],
		related: ['variants', 'preset']
	};

	const apiSections: PropsSection[] = [
		{ label: 'Button', presetKey: 'button', props: buttonProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {frontmatter} {apiSections}>
	{#snippet preset()}
		<DocOnly for="html">
			<p class="text-muted-foreground mb-4 text-sm">
				Customize the default styles by defining presets in your configuration:
			</p>
		</DocOnly>
		<DocCode lang="typescript" code={metadata.presetCode} />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic Button"
			description="Simple button with default styling."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Button Variants"
			description="Different visual styles for various contexts."
			{...ex('./examples/variants.svelte')}
		/>

		<DocExample
			title="Button Sizes"
			description="Different sizes for various use cases."
			{...ex('./examples/sizes.svelte')}
		/>

		<DocExample
			title="Disabled State"
			description="Disabled buttons are non-interactive."
			{...ex('./examples/disabled.svelte')}
		/>
	{/snippet}
</DocComponentPage>
