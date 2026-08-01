const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

setPreset({
  'tooltip.trigger': () => ({
    class: 'cursor-pointer'
  }),
  'tooltip.content': () => ({
    class: 'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95'
  })
});
`.trim();

const accessibilityFeatures = [
	'Uses aria-describedby for association',
	'Not shown on keyboard focus by default',
	'Non-essential information only',
	'Clear on mouse leave',
	'Screen reader compatible'
];

const useCases = [
	{
		title: 'Icon Explanations',
		description:
			'Provide text descriptions for icon-only buttons or controls to improve usability and accessibility.'
	},
	{
		title: 'Truncated Text',
		description:
			'Show full text content when hovering over truncated or ellipsized text in tables or lists.'
	},
	{
		title: 'Supplementary Information',
		description:
			'Display additional context, shortcuts, or help text without cluttering the main interface.'
	},
	{
		title: 'Status Indicators',
		description:
			'Explain the meaning of status badges, colored dots, or visual indicators on hover.'
	},
	{
		title: 'Disabled Elements',
		description:
			'Communicate why an element is disabled or what conditions must be met to enable it.'
	},
	{
		title: 'Data Previews',
		description:
			'Show quick previews of data, timestamps, or metadata without requiring navigation or clicks.'
	}
];

const componentsSummary = [
	{
		name: 'Tooltip.Root',
		description:
			'Container component that manages tooltip state, positioning, and visibility logic.'
	},
	{
		name: 'Tooltip.Trigger',
		description: 'Element that triggers the tooltip display on hover or focus events.'
	},
	{
		name: 'Tooltip.Content',
		description:
			'Floating panel containing the tooltip text or content, positioned relative to the trigger.'
	}
];

export const metadata = {
	title: 'Tooltip - Svelte Atoms',
	description: 'Display contextual information on hover or focus.',
	componentTitle: 'Tooltip',
	componentDescription:
		'Floating label providing additional context when hovering or focusing on an element.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Tooltip } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Tooltip' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
