const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  popover: () => ({
    class: 'z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none'
  }),
  'popover.trigger': () => ({
    class: 'inline-flex items-center justify-center rounded-md'
  }),
  'popover.content': () => ({
    class: 'w-full'
  })
});`.trim();

const accessibilityFeatures = [
	'ARIA attributes (aria-expanded, aria-haspopup)',
	'Keyboard navigation (Escape to close)',
	'Focus management',
	'Screen reader announcements',
	'Click outside to dismiss'
];

const useCases = [
	{
		title: 'User Account Menus',
		description:
			'Display user profile information, settings, and quick actions near the trigger button.'
	},
	{
		title: 'Contextual Help',
		description:
			'Show tooltips, hints, or additional information without navigating away from the current view.'
	},
	{
		title: 'Action Menus',
		description:
			'Present a list of actions or options related to a specific element (e.g., share, edit, delete).'
	},
	{
		title: 'Form Field Assistance',
		description:
			'Provide additional context, validation messages, or input suggestions near form fields.'
	},
	{
		title: 'Quick Previews',
		description:
			'Display preview content (e.g., image thumbnails, card details) when hovering or clicking on elements.'
	},
	{
		title: 'Filter Controls',
		description:
			'Show filter options or settings in a compact overlay without cluttering the main interface.'
	}
];

const componentsSummary = [
	{
		name: 'Popover.Root',
		description:
			'Root container that manages the popover state, positioning, and behavior. Controls the open/close state and coordinates all child components.'
	},
	{
		name: 'Popover.Trigger',
		description:
			'Interactive element that opens/closes the popover. Can be any clickable element like a button or link.'
	},
	{
		name: 'Popover.Content',
		description:
			"Container for the popover's main content. Positioned relative to the trigger using floating-ui."
	},
	{
		name: 'Popover.Indicator',
		description:
			"Optional visual indicator (e.g., chevron icon) that reflects the popover's open/closed state."
	},
	{
		name: 'Popover.Arrow',
		description:
			'Optional arrow pointer that visually connects the popover content to its trigger element.'
	}
];

export const metadata = {
	title: 'Popover - Svelte Atoms',
	description: 'Floating content panel triggered by user interaction.',
	componentTitle: 'Popover',
	componentDescription:
		'Floating panel displaying rich content near a trigger element for contextual information or actions.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Popover } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Popover' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
