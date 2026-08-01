const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  label: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'Always use for attribute to associate with input',
	'Place labels consistently (before or after inputs)',
	'Make required fields clear to screen readers',
	'Use semantic label element',
	'Ensure sufficient color contrast'
];

const useCases = [
	{
		title: 'Form Field Labels',
		description:
			'Associate descriptive text with form inputs like text fields, selects, and checkboxes to improve usability and accessibility.'
	},
	{
		title: 'Required Field Indicators',
		description:
			'Mark mandatory form fields clearly so users know which inputs they must fill out before submitting.'
	},
	{
		title: 'Accessible Input Naming',
		description:
			'Provide accessible names for form controls used by screen readers and assistive technologies via the for/id association.'
	},
	{
		title: 'Checkbox and Radio Labels',
		description:
			'Wrap or associate text with checkbox and radio inputs to make the clickable area larger and more user-friendly.'
	},
	{
		title: 'Field Descriptions',
		description:
			'Pair with helper text to give users context about what information is expected in a particular field.'
	}
];

export const metadata = {
	title: 'Label - Svelte Atoms',
	description: 'Accessible label element for associating descriptive text with form controls.',
	componentTitle: 'Label',
	componentDescription:
		'Semantic label component for form inputs with enhanced accessibility and interactive hit area.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Label } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Label' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
