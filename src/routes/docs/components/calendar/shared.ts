const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  'calendar.root': () => ({ class: 'inline-block' }),
  'calendar.header': () => ({ class: 'flex items-center justify-between px-2 py-1' }),
  'calendar.day': () => ({ class: 'h-9 w-9 rounded-md text-center' })
});
`.trim();

const accessibilityFeatures = [
	'Day grid rendered in a semantic table/list structure',
	'Keyboard-navigable day cells via the roving-focus capability',
	'Selected and disabled days surfaced through ARIA state',
	'Month navigation controls are focusable buttons'
];

const useCases = [
	{
		title: 'Date Fields',
		description: 'A standalone month grid for picking a single date or a date range.'
	},
	{
		title: 'Booking & Schedules',
		description: 'Show availability and let users pick a check-in / check-out range.'
	},
	{
		title: 'Bounded Selection',
		description: 'Constrain picks with min/max (e.g. only allow the current month).'
	}
];

export const metadata = {
	title: 'Calendar - Svelte Atoms',
	description: 'Composable month-grid calendar for single-date or range selection.',
	componentTitle: 'Calendar',
	componentDescription:
		'A headless-ish calendar that owns month pivote and selection state. Compose Root + Header + Body + Day to render the grid; the bond drives navigation and selection.',
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Calendar } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Calendar' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
