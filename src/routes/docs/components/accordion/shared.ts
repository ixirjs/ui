const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  accordion: () => ({
    class: 'divide-y divide-border rounded-lg border border-border'
  }),
  'accordion.item': () => ({
    class: ''
  }),
  'accordion.item.header': () => ({
    class: 'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-accent/50 transition-colors'
  }),
  'accordion.item.body': () => ({
    class: 'px-4 py-3 text-sm text-muted-foreground'
  })
});`.trim();

const accessibilityFeatures = [
	'Keyboard navigation (Arrow keys, Home, End)',
	'ARIA attributes (role="region", aria-expanded)',
	'Focus management between items',
	'Screen reader announcements',
	'Automatic ID generation for ARIA labeling'
];

const useCases = [
	{
		title: 'FAQ Sections',
		description:
			'Display frequently asked questions in an organized, expandable format that users can browse through easily.'
	},
	{
		title: 'Settings Panels',
		description:
			'Organize application settings into collapsible categories for better information hierarchy and usability.'
	},
	{
		title: 'Documentation Navigation',
		description:
			'Structure documentation sections with expandable topics, allowing users to focus on relevant information.'
	},
	{
		title: 'Product Features',
		description:
			'Showcase product features or specifications in an organized accordion format on marketing pages.'
	},
	{
		title: 'Form Sections',
		description:
			'Break down long forms into manageable sections that users can expand as they progress through the form.'
	},
	{
		title: 'Content Organization',
		description:
			'Organize large amounts of related content in a compact, scannable format that reduces initial page length.'
	}
];

const componentsSummary = [
	{
		name: 'Accordion.Root',
		description:
			'Root container that manages accordion state. Controls whether one or multiple items can be open simultaneously, and whether items can all be collapsed.'
	},
	{
		name: 'AccordionItem.Root',
		description:
			'Individual accordion item container. Can be disabled independently from the root accordion.'
	},
	{
		name: 'AccordionItem.Header',
		description:
			'Clickable header button that toggles the accordion item open/closed. Can contain text, icons, or custom content.'
	},
	{
		name: 'AccordionItem.Body',
		description:
			"Collapsible content area that reveals or hides based on the item's open state with animated transitions."
	},
	{
		name: 'AccordionItem.Indicator',
		description:
			"Optional visual indicator (chevron/arrow icon) that rotates to reflect the item's open/closed state."
	}
];

export const metadata = {
	title: 'Accordion - Svelte Atoms',
	description: 'Collapsible content sections for organizing information in a space-efficient way.',
	componentTitle: 'Accordion',
	componentDescription:
		'Collapsible content sections for FAQs and settings with single/multiple open items and keyboard navigation.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Accordion, AccordionItem } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Accordion' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
