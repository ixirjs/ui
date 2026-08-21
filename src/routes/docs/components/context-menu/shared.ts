const presetCode = `import { definePreset } from '@ixirjs/ui/preset';

const preset = definePreset({
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

export const metadata = {
	title: 'Context Menu - IXIR UI',
	description: 'Context menu component triggered by right-click interactions.',
	componentTitle: 'Context Menu',
	componentDescription:
		'Right-click activated menu that appears at cursor position. Ideal for contextual actions and shortcuts.',
	summary: 'Right-click contextual menu for element-level actions',
	category: 'Overlay' as const,
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: `import { ContextMenu } from '@ixirjs/ui';`,
	presetCode,
	accessibility: [
		'Right-click or Shift+F10 opens the menu on the trigger element',
		'Arrow keys navigate menu items',
		'Enter or Space activates a focused item',
		'Escape closes the menu'
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
		{ name: 'ContextMenu.Item', description: 'Actionable item with keyboard support' },
		{ name: 'ContextMenu.Divider', description: 'Visual separator between items' },
		{ name: 'ContextMenu.Group', description: 'Logical group of menu items' },
		{ name: 'ContextMenu.Title', description: 'Label for a menu-item group' },
		{ name: 'ContextMenu.Indicator', description: 'Popover state indicator' },
		{ name: 'ContextMenu.Tail', description: 'Optional popover tail' }
	]
};
