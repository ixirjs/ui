const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  divider: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'Semantic hr element for horizontal dividers',
	'Proper ARIA role when needed',
	'Sufficient visual contrast',
	'Does not interfere with screen readers',
	'Decorative element properly marked'
];

const useCases = [
	{
		title: 'Section Separation',
		description:
			'Visually separate distinct sections of a page or card, such as between a header and body, or between content groups.'
	},
	{
		title: 'List Item Separation',
		description:
			'Add subtle horizontal lines between list items in menus, settings panels, or navigation drawers.'
	},
	{
		title: 'Inline Content Separation',
		description:
			'Use the vertical variant to separate inline elements like breadcrumb items, toolbar buttons, or header action groups.'
	},
	{
		title: 'Form Section Grouping',
		description:
			'Divide a long form into labeled sections (e.g., "Personal Info" / "Account Settings") with an optional text label.'
	},
	{
		title: 'Authentication Alternatives',
		description:
			'Display an "OR" divider between social login buttons and email/password form inputs.'
	},
	{
		title: 'Card Layout Structure',
		description: 'Separate card header, body, and footer regions with consistent visual boundaries.'
	}
];

export const metadata = {
	title: 'Divider - Svelte Atoms',
	description:
		'Visual separator for structuring content sections, supporting horizontal, vertical, and labeled variants.',
	componentTitle: 'Divider',
	componentDescription:
		'Visual separator for content sections with horizontal/vertical orientation and optional labels.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Divider } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Divider' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
