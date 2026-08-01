<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocOnly, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { buttonProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

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

	const _loaders = import.meta.glob('./examples/*.svelte');
	const _sources = import.meta.glob('./examples/*.svelte', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;
	const ex = createExampleLoader(_loaders, _sources);
</script>

<DocComponentPage
	{contentType}
	{metadata}
	{frontmatter}
	prev={{ label: 'Breadcrumb', href: '/docs/components/breadcrumb' }}
	next={{ label: 'Calendar', href: '/docs/components/calendar' }}
>
	{#snippet preset()}
		<DocOnly for="html">
			<p class="text-muted-foreground mb-4 text-sm">
				Customize the default styles by defining presets in your configuration:
			</p>
		</DocOnly>
		<DocCode lang="typescript" code={metadata.examples.preset} />
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

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
