const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  breadcrumb: () => ({
    class: 'flex items-center gap-1 text-sm'
  }),
  'breadcrumb.item': () => ({
    class: 'text-foreground/70 hover:text-foreground rounded-lg px-2 py-1 hover:bg-accent/50 transition-colors'
  }),
  'breadcrumb.separator': () => ({
    class: 'text-muted-foreground px-0'
  })
});`.trim();

const accessibilityFeatures = [
	'Renders inside a nav element for landmark navigation',
	'Current page item can be marked with aria-current="page"',
	'Keyboard navigable links with visible focus indicators',
	'Default "/" separator is screen-reader friendly',
	'Semantic structure aids page orientation for screen reader users'
];

const useCases = [
	{
		title: 'Multi-level Navigation',
		description:
			"Show the user's current position within a nested site structure, such as product categories or documentation sections."
	},
	{
		title: 'E-commerce Category Paths',
		description:
			'Display the full path from root to a product page (e.g., Home > Electronics > Laptops) for quick back-navigation.'
	},
	{
		title: 'Documentation Sites',
		description:
			'Help readers understand where a page sits within the documentation hierarchy and navigate to parent sections quickly.'
	},
	{
		title: 'Admin Dashboards',
		description:
			'Provide context in complex admin UIs where users drill down through resources, settings, or records.'
	},
	{
		title: 'File Explorers',
		description:
			'Display the current directory path and allow users to jump to any parent directory in a file browser.'
	},
	{
		title: 'SEO Structured Data',
		description:
			'Complement JSON-LD breadcrumb schema markup with a visible, accessible breadcrumb trail on the page.'
	}
];

const componentsSummary = [
	{
		name: 'Breadcrumb.Root',
		description:
			'Container element (renders as a div by default) that wraps all breadcrumb items and separators.'
	},
	{
		name: 'Breadcrumb.Item',
		description:
			'Individual breadcrumb link or text node. Renders as an anchor by default; omit href for the current (non-linked) page item.'
	},
	{
		name: 'Breadcrumb.Separator',
		description:
			'Visual separator between items. Renders "/" by default; pass custom content to override.'
	}
];

export const metadata = {
	title: 'Breadcrumb - Svelte Atoms',
	description: "Navigation component showing the user's location within a site hierarchy.",
	componentTitle: 'Breadcrumb',
	componentDescription:
		'Navigational breadcrumb showing current location with customizable separators and styling.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Breadcrumb } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Breadcrumb' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
