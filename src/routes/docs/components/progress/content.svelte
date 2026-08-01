<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import {
		DocComponentPage,
		DocSection,
		DocExample,
		DocCode,
		DocPropsTabs
	} from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { progressLinearProps, progressCircularProps } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'progress',
		title: 'Progress',
		category: 'components',
		subcategory: 'feedback',
		depth: 'beginner',
		prerequisites: ['atoms', 'styling'],
		related: ['variants', 'preset']
	};

	const apiSections: PropsSection[] = [
		{ label: 'Linear', presetKey: 'progress.linear', props: progressLinearProps },
		{ label: 'Circular', presetKey: 'progress.circular', props: progressCircularProps }
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
	prev={{ label: 'Popover', href: '/docs/components/popover' }}
	next={{ label: 'Radio', href: '/docs/components/radio' }}
>
	{#snippet extra()}
		<DocSection
			title="Linear Progress"
			subtitle="Horizontal bar showing determinate or indeterminate progress"
		>
			<DocExample
				title="Basic"
				description="Determinate linear progress bar"
				{...ex('./examples/linear-basic.svelte')}
			/>
			<DocExample
				title="Indeterminate"
				description="Animated bar for unknown completion time"
				{...ex('./examples/linear-indeterminate.svelte')}
			/>
		</DocSection>

		<DocSection title="Circular Progress" subtitle="Circular indicator for compact layouts">
			<DocExample
				title="Basic"
				description="Determinate circular progress"
				{...ex('./examples/circular-basic.svelte')}
			/>
			<DocExample
				title="Indeterminate"
				description="Spinning indicator for unknown duration"
				{...ex('./examples/circular-indeterminate.svelte')}
			/>
		</DocSection>

		<DocSection title="Composition" subtitle="Custom label via children snippet">
			<DocExample
				title="Custom Label"
				description="Render a custom label after the progress bar using children"
				{...ex('./examples/composition-label.svelte')}
			/>
		</DocSection>

		<DocSection title="Preset Configuration" subtitle="Customise appearance using presets">
			<DocCode code={metadata.examples.preset} lang="typescript" />
		</DocSection>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
