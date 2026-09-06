<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { dropdownMenuRootProps, dropdownMenuItemProps, dropdownMenuContentProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'DropdownMenu.Root', presetKey: 'dropdown-menu', props: dropdownMenuRootProps },
		{ label: 'DropdownMenu.Content', props: dropdownMenuContentProps },
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
	{#snippet extra()}
		<DocSection title="State and customization">
			<code>DropdownMenu.Root</code> owns the canonical <code>dropdown-menu</code> profile. Its
			<code>children</code> snippet receives <code>popover</code>, typed as the
			<code>DropdownMenuBond</code> interface. Use bindable props and Bond commands, not a
			constructor or <code>factory</code> prop. The root handles teardown; see the
			<a href="/docs/migration">popup migration notes</a> for standalone authoring.
		</DocSection>
	{/snippet}
</DocComponentPage>
