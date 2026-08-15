<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { breadcrumbRootProps, breadcrumbItemProps, breadcrumbSeparatorProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Breadcrumb.Root', presetKey: 'breadcrumb', props: breadcrumbRootProps },
		{ label: 'Breadcrumb.Item', presetKey: 'breadcrumb.item', props: breadcrumbItemProps },
		{
			label: 'Breadcrumb.Separator',
			presetKey: 'breadcrumb.separator',
			props: breadcrumbSeparatorProps
		}
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Breadcrumb"
			description="Simple breadcrumb navigation"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Custom Separator"
			description="Use custom separator between items"
			{...ex('./examples/custom-separator.svelte')}
		/>
	{/snippet}
</DocComponentPage>
