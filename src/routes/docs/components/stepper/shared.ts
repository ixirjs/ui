const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  stepper: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'Keyboard navigation support',
	'ARIA attributes for step status',
	'Focus management',
	'Screen reader announcements for step changes'
];

const useCases = [
	{
		title: 'Multi-step Forms',
		description:
			'Break complex registration or checkout forms into discrete, guided steps to reduce cognitive load and improve completion rates.'
	},
	{
		title: 'Onboarding Flows',
		description:
			'Guide new users through a structured onboarding sequence with progress indicators showing where they are in the process.'
	},
	{
		title: 'Installation Wizards',
		description:
			'Lead users through software setup or configuration processes with clear step indicators and back/next navigation.'
	},
	{
		title: 'Order or Booking Process',
		description:
			'Present e-commerce checkout or reservation flows (select, configure, confirm, pay) as sequential, trackable steps.'
	},
	{
		title: 'Progress Tracking',
		description:
			'Visualize progress through a workflow, project phase, or approval process with completed, active, and pending step states.'
	},
	{
		title: 'Educational Modules',
		description:
			'Structure learning paths or tutorials as steps with optional and required segments and linear or free navigation modes.'
	}
];

const componentsSummary = [
	{
		name: 'Stepper.Root',
		description:
			'Root container managing the active step state, orientation, and linear progression mode.'
	},
	{
		name: 'Stepper.Header',
		description: 'Container for the step indicator row, typically rendered horizontally at the top.'
	},
	{
		name: 'Stepper.Body',
		description: 'Container that renders the active step content area.'
	},
	{
		name: 'Stepper.Content',
		description:
			'Displays the body content of the currently active step with optional enter/exit animations.'
	},
	{
		name: 'Stepper.Footer',
		description:
			'Container for navigation buttons (Previous/Next) with access to the stepper bond for state.'
	},
	{
		name: 'Step.Root',
		description:
			'Individual step item managing its own active, completed, optional, and disabled states.'
	},
	{
		name: 'Step.Header',
		description: 'Clickable header area of a step that triggers step navigation when clicked.'
	},
	{
		name: 'Step.Indicator',
		description: 'Visual step number or icon indicator showing the step index or completion state.'
	},
	{
		name: 'Step.Title',
		description: 'Title text for the step, displayed alongside the indicator.'
	},
	{
		name: 'Step.Description',
		description: 'Optional subtitle or description text for additional context about the step.'
	},
	{
		name: 'Step.Separator',
		description: 'Visual line connecting adjacent step indicators in the header.'
	},
	{
		name: 'Step.Body',
		description: 'Content area for the step, shown when this step is active in the stepper body.'
	}
];

export const metadata = {
	title: 'Stepper - Svelte Atoms',
	description: 'Multi-step wizard component for guided workflows, forms, and onboarding processes.',
	componentTitle: 'Stepper',
	componentDescription:
		'Multi-step workflow component with linear/free navigation and animated transitions.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Stepper } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Stepper' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
