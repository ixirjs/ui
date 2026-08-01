const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  drawer: () => ({
    class: 'fixed inset-0 z-50'
  }),
  'drawer.backdrop': () => ({
    class: 'fixed inset-0 bg-background/80 backdrop-blur-sm'
  }),
  'drawer.content': () => ({
    class: 'fixed z-50 bg-background shadow-lg transition-transform'
  }),
  'drawer.header': () => ({
    class: 'border-b border-border px-6 py-4'
  }),
  'drawer.footer': () => ({
    class: 'border-t border-border px-6 py-4'
  })
});`.trim();

const accessibilityFeatures = [
	'Focus trap within drawer',
	'Escape key to close',
	'ARIA attributes (role="dialog", aria-modal)',
	'Returns focus to trigger on close',
	'Screen reader announcements',
	'Keyboard navigation support'
];

const useCases = [
	{
		title: 'Navigation Menus',
		description:
			'Slide-out navigation panels for mobile and responsive layouts, providing access to main app navigation.'
	},
	{
		title: 'Filters and Settings',
		description:
			"Show filtering options or settings panels that don't require full-page navigation."
	},
	{
		title: 'Shopping Carts',
		description:
			'Display shopping cart contents in a side panel for e-commerce applications without leaving the current page.'
	},
	{
		title: 'Notification Panels',
		description:
			'Show notifications, messages, or activity feeds in a drawer that slides in from the side.'
	},
	{
		title: 'Detail Views',
		description:
			'Display detailed information about selected items while keeping the main content visible.'
	},
	{
		title: 'Form Sidebars',
		description:
			'Present forms or data entry panels as side drawers for editing or creating content.'
	}
];

const componentsSummary = [
	{
		name: 'Drawer.Root',
		description:
			'Root container that manages drawer state, backdrop, and focus trap. Controls open/close state and slide direction.'
	},
	{
		name: 'Drawer.Content',
		description:
			'Main container for drawer content. Slides in from specified edge (left, right, top, bottom).'
	},
	{
		name: 'Drawer.Header',
		description: 'Optional header section for drawer title and close button.'
	},
	{
		name: 'Drawer.Body',
		description: 'Main content area of the drawer.'
	},
	{
		name: 'Drawer.Footer',
		description: 'Optional footer section for action buttons.'
	},
	{
		name: 'Drawer.Title',
		description: 'Semantic title element with proper ARIA labeling.'
	},
	{
		name: 'Drawer.Description',
		description: 'Semantic description for additional context to screen readers.'
	},
	{
		name: 'Drawer.Backdrop',
		description: 'Overlay backdrop that dims the background when drawer is open.'
	}
];

export const metadata = {
	title: 'Drawer - Svelte Atoms',
	description: 'Side panel that slides in from screen edge.',
	componentTitle: 'Drawer',
	componentDescription:
		'Side panel that slides in from screen edge, perfect for navigation menus and contextual content.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Drawer } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Drawer' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
