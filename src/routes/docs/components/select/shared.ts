const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  select: () => ({
    class: 'relative inline-block text-left'
  }),
  'select.trigger': () => ({
    class: 'relative flex h-auto min-h-10 flex-wrap items-center border border-border rounded-md bg-background px-3 py-2 text-sm hover:bg-accent transition-colors'
  }),
  'select.item': () => ({
    class: 'block w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors cursor-pointer'
  }),
  'select.query': () => ({
    class: 'inline-flex h-auto w-auto flex-1 py-1'
  })
});`.trim();

const accessibilityFeatures = [
	'Keyboard navigation (Arrow keys, Enter, Escape)',
	'ARIA attributes (role="menu", role="menuitem")',
	'Focus management',
	'Screen reader support',
	'Click outside to close',
	'Multiple selection support'
];

const useCases = [
	{
		title: 'Action Menus',
		description:
			'Display a list of actions or commands that users can select from (e.g., file operations, user actions).'
	},
	{
		title: 'Filter Controls',
		description:
			'Provide filtering options for data tables, lists, or search results with single or multiple selection.'
	},
	{
		title: 'Item Selection',
		description:
			'Allow users to select one or more items from a list with search and filtering capabilities.'
	},
	{
		title: 'Navigation Menus',
		description: 'Create dropdown navigation menus for site navigation or contextual menu options.'
	},
	{
		title: 'Form Field Replacements',
		description:
			'Replace traditional select elements with more customizable and feature-rich select components.'
	},
	{
		title: 'Context Menus',
		description: 'Show contextual actions or options related to specific UI elements or data items.'
	}
];

const componentsSummary = [
	{
		name: 'Select.Root',
		description:
			'Root container that manages select state, selection values, and coordinates all child components. Supports single or multiple selection modes.'
	},
	{
		name: 'Select.Trigger',
		description:
			'Interactive element that opens/closes the select. Can be composed with other components like Input or Button.'
	},
	{
		name: 'Select.Content',
		description:
			'Container for select items. Positioned relative to trigger using floating-ui. Can contain search inputs and scrollable lists.'
	},
	{
		name: 'Select.Item',
		description:
			'Individual selectable item in the select. Handles selection state and keyboard navigation.'
	},
	{
		name: 'Select.Query',
		description:
			'Search input component for filtering select items. Integrates with filterSelectData utility.'
	},
	{
		name: 'Select.Selections',
		description:
			'Displays currently selected items in multiple selection mode. Typically shown in the trigger area.'
	},
	{
		name: 'Select.Selection',
		description:
			'Individual selected item representation with remove functionality in multiple selection mode.'
	},
	{
		name: 'Select.Placeholder',
		description: 'Placeholder text shown when no items are selected.'
	}
];

export const metadata = {
	title: 'Select - Svelte Atoms',
	description: 'Select component for actions and options.',
	componentTitle: 'Select',
	componentDescription:
		'Flexible select with single/multiple selection, search, and advanced composition via Dropdown and Popover.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Select } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Select' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
