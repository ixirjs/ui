const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  chip: () => ({
    class: 'inline-flex w-fit cursor-pointer items-center gap-1 rounded-md px-3 py-1 transition-colors'
  }),
  'chip.close': () => ({
    class: 'inline-flex aspect-square h-full items-center justify-center rounded-xs p-0.5'
  })
});
`.trim();

const accessibilityFeatures = [
	'Dismissible control renders a native `<button type="button">` (keyboard + screen-reader accessible)',
	'Replace the default close button via the `closeButton` snippet for custom ARIA or focus handling',
	'Semantic container element (`div`) that accepts arbitrary HTML/ARIA attributes through atom props'
];

const useCases = [
	{
		title: 'Filter Tags',
		description: 'Dismissible labels in a filter bar where each chip removes a selected facet.'
	},
	{
		title: 'Input Chips',
		description: 'Tokens in an email or multi-value field, each removable with a close button.'
	},
	{
		title: 'Selection Pills',
		description: 'Compact selected-option summaries inside selects, comboboxes, or filters.'
	},
	{
		title: 'Metadata Badges',
		description: 'Small inline labels for categories, versions, or statuses that can be cleared.'
	}
];

export const metadata = {
	title: 'Chip - Svelte Atoms',
	description: 'Compact, dismissible inline label with a wired close button.',
	componentTitle: 'Chip',
	componentDescription:
		'A small inline element that renders a label with a dismissible close button. The default close button fires `onclose`, or supply a `closeButton` snippet to fully replace it.',
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Chip, ChipCloseButton } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Chip' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
