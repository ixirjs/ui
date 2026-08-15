<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { avatarProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Avatar', presetKey: 'avatar', props: avatarProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Avatar"
			description="Simple avatar with image"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="Avatar Sizes"
			description="Different sizes for various contexts"
			{...ex('./examples/sizes.svelte')}
		/>
		<DocExample
			title="Fallback Initials"
			description="Automatic initials when no image is provided"
			{...ex('./examples/fallback.svelte')}
		/>
		<DocExample
			title="Avatar Group"
			description="Display multiple avatars in a group"
			{...ex('./examples/group.svelte')}
		/>
	{/snippet}
</DocComponentPage>
