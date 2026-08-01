const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  sidebar: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'Keyboard navigation (Escape to close)',
	'Focus trap when open',
	'ARIA attributes for navigation',
	'Screen reader announcements',
	'Backdrop click to dismiss'
];

const useCases = [
	{
		title: 'Navigation Drawers',
		description:
			'Implement collapsible navigation panels that slide in from the left or right edge to display menus, links, or filters.'
	},
	{
		title: 'Detail Panels',
		description:
			'Show contextual details or metadata for a selected item without navigating away from the main content view.'
	},
	{
		title: 'Filter and Search Panels',
		description:
			'Reveal advanced filter controls or search options in a side panel to keep the main UI uncluttered.'
	},
	{
		title: 'Dashboard Widgets',
		description:
			'Expand collapsible sidebar sections to display charts, stats, or additional data alongside the primary content area.'
	},
	{
		title: 'Settings Panels',
		description:
			'Slide in application or page-level settings alongside the content being edited or viewed.'
	}
];

const componentsSummary = [
	{
		name: 'Sidebar.Root',
		description:
			'Root container that manages the open/closed state and provides the sidebar context to child components.'
	},
	{
		name: 'Sidebar.Content',
		description:
			'The animated sidebar panel that slides in/out. Accepts width, enter/exit animations, and custom styling.'
	}
];

export const metadata = {
	title: 'Sidebar - Svelte Atoms',
	description:
		'Collapsible side panel component for navigation drawers, detail views, and filter panels.',
	componentTitle: 'Sidebar',
	componentDescription:
		'Collapsible side panel with left/right placement, smooth animations, and state binding.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Sidebar } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Sidebar' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
