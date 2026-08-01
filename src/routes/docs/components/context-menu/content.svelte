<script lang="ts">
	import { resolve } from '$app/paths';
	import { createExampleLoader } from '$docs/utils/example-loader';
	import {
		DocComponentPage,
		DocExample,
		DocSection,
		DocOnly,
		DocPropsTabs
	} from '$docs/components';
	import type { ComponentDocMeta, PropsSection } from '$docs/components';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';
	import {
		contextMenuRootProps,
		contextMenuTriggerProps,
		contextMenuContentProps,
		contextMenuItemProps
	} from './props';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'context-menu',
		title: 'Context Menu',
		category: 'components',
		depth: 'intermediate',
		prerequisites: ['dropdown-menu', 'popover'],
		related: ['menu', 'dropdown-menu', 'popover']
	};

	const presetCode = `import { createPreset } from '@svelte-atoms/core';

const preset = createPreset({
  'context-menu.trigger': () => ({
    class: 'cursor-context-menu select-none'
  }),
  'context-menu.content': () => ({
    class: 'min-w-[10rem] rounded-md border bg-popover p-1 shadow-md'
  }),
  'context-menu.item': () => ({
    class: 'rounded-sm px-2 py-1.5 text-sm hover:bg-accent'
  })
});`;

	const metadata: ComponentDocMeta = {
		componentTitle: 'Context Menu',
		componentDescription:
			'Right-click activated menu that appears at cursor position. Ideal for contextual actions and shortcuts.',
		componentType: 'compound',
		status: 'stable',
		packageName: '@svelte-atoms/core',
		importCode: `import { ContextMenu } from '@svelte-atoms/core/context-menu';`,
		breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Context Menu' }],
		presetCode,
		accessibility: [
			'Right-click or Shift+F10 opens the menu on the trigger element',
			'Arrow keys navigate menu items',
			'Enter or Space activates a focused item',
			'Escape closes the menu',
			'Tab exits the menu and returns focus to normal flow'
		],
		useCases: [
			{
				title: 'Contextual actions at cursor position',
				description: 'Open a menu exactly where the user right-clicks'
			},
			{
				title: 'Row/item actions in dense data interfaces',
				description: 'Attach per-row menus without extra UI chrome'
			},
			{
				title: 'Right-click interactions without layout shift',
				description: 'Non-destructive overlay that keeps the page stable'
			}
		],
		componentsSummary: [
			{ name: 'ContextMenu.Root', description: 'Provides shared dropdown state and positioning' },
			{
				name: 'ContextMenu.Trigger',
				description: 'Captures right-click and opens at pointer coordinates'
			},
			{ name: 'ContextMenu.Content', description: 'Floating menu container' },
			{ name: 'ContextMenu.Item', description: 'Actionable item with keyboard support' }
		]
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
	prev={{ label: 'Combobox', href: '/docs/components/combobox' }}
	next={{ label: 'DataGrid', href: '/docs/components/datagrid' }}
>
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

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}

	{#snippet extra()}
		<DocSection title="Related Components">
			<DocOnly for="markdown">
				- [Dropdown Menu](/docs/components/dropdown-menu): Underlying selection and item behavior
				reused by ContextMenu - [Popover](/docs/components/popover): Floating panel with positioning
				logic
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
							Underlying selection and item behavior reused by ContextMenu
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
