<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { dropdownMenuItemProps, dropdownMenuContentProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'DropdownMenu.Root', presetKey: 'dropdown-menu', props: dropdownMenuContentProps },
		{ label: 'DropdownMenu.Item', presetKey: 'dropdown-menu.item', props: dropdownMenuItemProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Dropdown Menu"
			description="Simple menu with navigation items"
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Interactive Menu"
			description="Menu items with click handlers"
			{...ex('./examples/interactive.svelte')}
		/>
	{/snippet}
</DocComponentPage>
