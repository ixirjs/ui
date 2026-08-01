const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  tabs: () => ({
    class: 'w-full'
  }),
  'tabs.header': () => ({
    class: 'border-b border-border'
  }),
  'tabs.content': () => ({
    class: 'mt-4'
  }),
  'tab.header': () => ({
    class: 'inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors hover:bg-accent data-[active=true]:border-b-2 data-[active=true]:border-primary'
  })
});`.trim();

const accessibilityFeatures = [
	'ARIA tabs pattern (`role="tablist"` on `Tabs.Header`, `role="tab"` on `Tab.Header`, `role="tabpanel"` on `Tab.Body`)',
	'`aria-controls` linking each tab trigger to its content panel',
	'`aria-labelledby` / `aria-describedby` on content panels',
	'`aria-disabled` reflects the `disabled` prop on `Tab.Root`',
	'`aria-orientation="horizontal"` on the root container',
	'`data-active` attribute on both header and body for CSS state targeting'
];

const useCases = [
	{
		title: 'Content Organization',
		description:
			'Organize related content into separate, switchable panels for better information architecture and user navigation.'
	},
	{
		title: 'Settings Interfaces',
		description:
			'Group different categories of settings (account, privacy, notifications) into tabs for easier management.'
	},
	{
		title: 'Dashboard Views',
		description:
			'Switch between different data views or reports without page navigation (analytics, performance, reports).'
	},
	{
		title: 'Product Details',
		description:
			'Display product information across multiple tabs (overview, specifications, reviews, related items).'
	},
	{
		title: 'Documentation',
		description:
			'Present code examples, API reference, and guides in tabbed interface for better developer experience.'
	},
	{
		title: 'Multi-step Forms',
		description:
			'Break complex forms into logical sections accessed via tabs while maintaining context.'
	}
];

const componentsSummary = [
	{
		name: 'Tabs.Root',
		description:
			'Root container that manages the active tab state and coordinates all child components.'
	},
	{
		name: 'Tabs.Header',
		description:
			'Container for tab triggers. Typically renders as a horizontal list of clickable tabs.'
	},
	{
		name: 'Tabs.Body',
		description: 'Container for tab content panels.'
	},
	{
		name: 'Tabs.Content',
		description: "Renders the active tab's content. Automatically switches based on selected tab."
	},
	{
		name: 'Tab.Root',
		description: 'Individual tab item that contains both the header (trigger) and body (content).'
	},
	{
		name: 'Tab.Header',
		description: 'Clickable tab trigger element that switches to this tab when activated.'
	},
	{
		name: 'Tab.Body',
		description: 'Content panel for this specific tab, shown when tab is active.'
	},
	{
		name: 'Tab.Description',
		description: 'Optional description or subtitle for the tab content.'
	}
];

export const metadata = {
	title: 'Tabs - Svelte Atoms',
	description: 'Organize content into multiple panels.',
	componentTitle: 'Tabs',
	componentDescription:
		'Tabbed interface for organizing content into separate views with keyboard navigation and active state management.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Tabs, Tab } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Tabs' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
