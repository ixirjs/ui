const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  collapsible: () => ({
    class: 'w-full space-y-2'
  }),
  'collapsible.header': () => ({
    class: 'flex w-full items-center justify-between rounded-md border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors'
  }),
  'collapsible.body': () => ({
    class: 'overflow-hidden text-sm text-muted-foreground px-4 py-3 border border-t-0 rounded-b-md border-border'
  })
});`.trim();

const accessibilityFeatures = [
	'ARIA attributes (aria-expanded, aria-controls)',
	'Keyboard accessible trigger',
	'Proper semantic structure',
	'Screen reader support',
	'Focus management'
];

const useCases = [
	{
		title: 'FAQ Items',
		description:
			'Individual FAQ questions that can be expanded to reveal answers without affecting other questions.'
	},
	{
		title: 'Progressive Disclosure',
		description:
			'Show basic information by default with option to reveal advanced details or settings when needed.'
	},
	{
		title: 'Compact List Items',
		description:
			'Display list items with summary view that can expand to show full details without navigation.'
	},
	{
		title: 'Filter Options',
		description:
			'Toggleable filter sections in sidebars that can be collapsed to save space when not in use.'
	},
	{
		title: 'Content Previews',
		description:
			'Show content previews or summaries with the ability to expand for full content view.'
	},
	{
		title: 'Settings Sections',
		description: 'Group related settings that can be hidden or shown based on user needs.'
	}
];

const componentsSummary = [
	{
		name: 'Collapsible.Root',
		description:
			'Root container that manages the collapsible open/closed state and coordinates child components.'
	},
	{
		name: 'Collapsible.Header',
		description:
			'Clickable header element that toggles the collapsible open/closed state. Can contain any content.'
	},
	{
		name: 'Collapsible.Body',
		description:
			'Collapsible content area that expands and collapses with animated transitions based on the open state.'
	},
	{
		name: 'Collapsible.Indicator',
		description:
			'Optional visual indicator (e.g., chevron icon) that rotates or changes to reflect the open/closed state.'
	}
];

export const metadata = {
	title: 'Collapsible - Svelte Atoms',
	description: 'Expandable container for showing and hiding content on demand.',
	componentTitle: 'Collapsible',
	componentDescription:
		'Toggle visibility of content sections with independent open/closed state and animated transitions.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Collapsible } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Collapsible' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
