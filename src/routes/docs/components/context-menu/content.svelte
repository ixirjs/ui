<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { resolve } from '$app/paths';
	import { DocComponentPage, DocExample, DocSection, DocOnly } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import type { Frontmatter } from '$docs/md/frontmatter';
	import { metadata } from './shared';
	import {
		contextMenuRootProps,
		contextMenuTriggerProps,
		contextMenuContentProps,
		contextMenuItemProps
	} from './props';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const frontmatter: Frontmatter = {
		id: 'context-menu',
		title: 'Context Menu',
		category: 'components',
		depth: 'intermediate',
		prerequisites: ['dropdown-menu', 'popover'],
		related: ['menu', 'dropdown-menu', 'popover']
	};

	const apiSections: PropsSection[] = [
		{ label: 'ContextMenu.Root', presetKey: 'context-menu', props: contextMenuRootProps },
		{
			label: 'ContextMenu.Trigger',
			presetKey: 'context-menu.trigger',
			props: contextMenuTriggerProps
		},
		{
			label: 'ContextMenu.Content',
			presetKey: 'context-menu.content',
			props: contextMenuContentProps
		},
		{ label: 'ContextMenu.Item', presetKey: 'context-menu.item', props: contextMenuItemProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {frontmatter} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic Zone"
			description="Right-click the zone to open the menu"
			{...ex('./examples/basic.svelte')}
		/>
		<DocExample
			title="On Button"
			description="Use Button as the trigger base"
			{...ex('./examples/button.svelte')}
		/>
		<DocExample
			title="On DataGrid Row"
			description="Row-level context actions"
			{...ex('./examples/row.svelte')}
		/>
	{/snippet}

	{#snippet extra()}
		<DocSection title="State and customization">
			<code>ContextMenu.Root</code> owns the canonical <code>context-menu</code> profile. Its
			<code>children</code> snippet receives <code>popover</code>, typed as the
			<code>ContextMenuBond</code> interface. Use bindable props and Bond commands, not a
			constructor or <code>factory</code> prop. The root handles teardown; see the
			<a href="/docs/migration">popup migration notes</a> for standalone authoring.
		</DocSection>

		<DocSection title="Related Components">
			<DocOnly for="markdown">
				- [Dropdown Menu](/docs/components/dropdown-menu): Shared navigation, typeahead and item
				behavior reused by ContextMenu - [Popover](/docs/components/popover): Floating panel with
				positioning logic
			</DocOnly>

			<DocOnly for="html">
				<div class="grid gap-4 sm:grid-cols-2">
					<a
						href={resolve('/docs/components/dropdown-menu')}
						class="border-border hover:border-primary group rounded-lg border p-4 transition-colors"
					>
						<h4 class="group-hover:text-primary mb-1 font-semibold transition-colors">
							Dropdown Menu
						</h4>
						<p class="text-muted-foreground text-sm">
							Shared navigation, typeahead and item behavior reused by ContextMenu
						</p>
					</a>
					<a
						href={resolve('/docs/components/popover')}
						class="border-border hover:border-primary group rounded-lg border p-4 transition-colors"
					>
						<h4 class="group-hover:text-primary mb-1 font-semibold transition-colors">Popover</h4>
						<p class="text-muted-foreground text-sm">Floating panel with positioning logic</p>
					</a>
				</div>
			</DocOnly>
		</DocSection>
	{/snippet}
</DocComponentPage>
