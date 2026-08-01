const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  radio: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'Use proper grouping with fieldset/legend',
	'Associate labels with radio buttons',
	'Keyboard navigation (Arrow keys)',
	'Clear visual focus indicators',
	'Screen reader friendly'
];

const useCases = [
	{
		title: 'Single-choice Forms',
		description:
			'Present mutually exclusive options in forms where users must select exactly one value, such as gender, subscription tier, or payment method.'
	},
	{
		title: 'Settings and Preferences',
		description:
			'Allow users to choose between predefined options for app settings like theme, language, or notification frequency.'
	},
	{
		title: 'Survey Questions',
		description:
			'Render single-answer survey or quiz questions with clear, labeled options grouped under a shared question.'
	},
	{
		title: 'Filter Controls',
		description:
			'Build exclusive filter toggles for sorting or filtering data views, like choosing between ascending and descending order.'
	},
	{
		title: 'Shipping or Delivery Options',
		description:
			'Let users select one delivery method (standard, express, overnight) from a visually grouped set of options.'
	}
];

const componentsSummary = [
	{
		name: 'Radio',
		description:
			'Individual radio input with an optional label. Manages checked state based on value comparison.'
	},
	{
		name: 'RadioGroup',
		description:
			'Container that groups multiple Radio inputs, synchronizing their selection state and shared name/disabled/required attributes.'
	}
];

export const metadata = {
	title: 'Radio - Svelte Atoms',
	description:
		'Radio button component for selecting a single option from a group of mutually exclusive choices.',
	componentTitle: 'Radio',
	componentDescription:
		'Radio button for single selections with group support and full accessibility states.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Radio } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Radio' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
