const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  'date-picker': () => ({ class: 'inline-block' }),
  'date-picker.trigger': () => ({ class: 'inline-flex w-full items-center justify-between' }),
  'date-picker.calendar': () => ({ class: 'rounded-lg border p-3' })
});
`.trim();

const accessibilityFeatures = [
	'Trigger is a focusable button (rendered through the `base` component, e.g. `Button`)',
	'Calendar popover supports keyboard navigation and dismiss (escape / outside press)',
	'Selected date is reflected in the trigger label for screen-reader users'
];

const useCases = [
	{
		title: 'Date Fields',
		description:
			'A single-date picker for forms: birth date, appointment, or scheduled publish time.'
	},
	{
		title: 'Date Ranges',
		description: 'Pick a start/end range for reports, bookings, or analytics filters.'
	},
	{
		title: 'Bounded Selection',
		description: 'Constrain picks with `min`/`max` (e.g. only allow the next 30 days).'
	}
];

export const metadata = {
	title: 'DatePicker - Svelte Atoms',
	description: 'Popover calendar wired to a trigger for single or range date selection.',
	componentTitle: 'DatePicker',
	componentDescription:
		'A composed overlay that anchors a Calendar to a trigger. Supports single-date and range selection, min/max bounds, and configurable placement.',
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { DatePicker } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'DatePicker' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
