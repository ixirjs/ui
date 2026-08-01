const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  card: () => ({
    class: 'rounded-lg border bg-card text-card-foreground shadow-sm'
  }),
  'card.header': () => ({
    class: 'flex flex-col space-y-1.5 p-6'
  }),
  'card.title': () => ({
    class: 'text-2xl font-semibold leading-none tracking-tight'
  }),
  'card.subtitle': () => ({
    class: 'text-sm text-muted-foreground'
  }),
  'card.description': () => ({
    class: 'text-sm text-muted-foreground'
  }),
  'card.body': () => ({
    class: 'p-6 pt-0'
  }),
  'card.footer': () => ({
    class: 'flex items-center p-6 pt-0'
  }),
  'card.media': () => ({
    class: 'overflow-hidden rounded-t-lg'
  })
});
`.trim();

const accessibilityFeatures = [
	'Proper semantic HTML structure',
	'Keyboard navigation for clickable cards',
	'ARIA attributes for interactive states',
	'Focus management and visible focus indicators',
	'Screen reader support for card content'
];

const useCases = [
	{
		title: 'Content Previews',
		description:
			'Display article summaries, blog post previews, or product overviews with title, description, and actions.'
	},
	{
		title: 'Dashboard Widgets',
		description:
			'Organize dashboard metrics, charts, and data visualizations into distinct, scannable cards.'
	},
	{
		title: 'Feature Highlights',
		description:
			'Showcase key features, benefits, or services in marketing pages with icons and call-to-action buttons.'
	},
	{
		title: 'User Profiles',
		description: 'Present user information, avatars, bio, and action buttons in profile cards.'
	},
	{
		title: 'Product Catalog',
		description:
			'Display products with images, prices, descriptions, and purchase actions in e-commerce grids.'
	},
	{
		title: 'Settings Panels',
		description:
			'Group related configuration options into cards for better organization in settings interfaces.'
	}
];

const componentsSummary = [
	{
		name: 'Card.Root',
		description:
			'Container component that provides the card structure, clickable behavior, and coordinates child components.'
	},
	{
		name: 'Card.Header',
		description:
			'Header section typically containing the title, subtitle, and description at the top of the card.'
	},
	{
		name: 'Card.Title',
		description: 'Main heading element for the card, displayed prominently in the header.'
	},
	{
		name: 'Card.Subtitle',
		description: 'Secondary heading below the title, providing a brief additional descriptor.'
	},
	{
		name: 'Card.Description',
		description:
			'Supporting text that provides additional context or detail beneath the title/subtitle.'
	},
	{
		name: 'Card.Body',
		description:
			'Main content area for the card, containing the primary information or interactive elements.'
	},
	{
		name: 'Card.Media',
		description:
			'Media container for images, videos, or other visual content, typically placed at the top of the card.'
	},
	{
		name: 'Card.Footer',
		description: 'Bottom section for action buttons, metadata, or supplementary content.'
	}
];

export const metadata = {
	title: 'Card - Svelte Atoms',
	description: 'Flexible container component for grouped content with headers, body, and footers.',
	componentTitle: 'Card',
	componentDescription:
		'Modular card for organizing content into distinct sections with header, body, media, and footer.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Card } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Card' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
