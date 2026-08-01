const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  alert: () => ({
    class: 'relative w-full rounded-lg border p-4'
  }),
  'alert.icon': () => ({
    class: 'h-4 w-4'
  }),
  'alert.title': () => ({
    class: 'mb-1 font-medium leading-none tracking-tight'
  }),
  'alert.description': () => ({
    class: 'text-sm opacity-90'
  })
});
`.trim();

const accessibilityFeatures = [
	'Uses appropriate ARIA role attributes',
	'Semantic HTML structure with proper heading hierarchy',
	'Sufficient color contrast ratios for all variants',
	'Keyboard accessible dismiss button with focus indicators',
	'Screen reader announcements for alert content',
	'Support for assistive technologies'
];

const useCases = [
	{
		title: 'System Notifications',
		description:
			'Display important system messages like updates, maintenance windows, or service disruptions to users.'
	},
	{
		title: 'Form Validation',
		description:
			'Show error messages, warnings, or success confirmations after form submissions or data validation.'
	},
	{
		title: 'User Feedback',
		description:
			'Provide immediate visual feedback for user actions like save operations, deletions, or updates.'
	},
	{
		title: 'Information Display',
		description:
			'Highlight important information, tips, or contextual help within the application interface.'
	},
	{
		title: 'Warning Messages',
		description:
			'Alert users to potential issues, rate limits, or actions that require their attention before proceeding.'
	},
	{
		title: 'Status Updates',
		description:
			'Communicate ongoing processes, connection status, or feature availability to users in real-time.'
	}
];

const componentsSummary = [
	{
		name: 'Alert.Root',
		description:
			'Container component that provides the alert structure and styling variant support.'
	},
	{
		name: 'Alert.Icon',
		description:
			'Optional icon container that displays visual indicators matching the alert variant.'
	},
	{
		name: 'Alert.Title',
		description: 'Heading element for the alert message, typically bold or emphasized text.'
	},
	{
		name: 'Alert.Description',
		description: 'Body text container providing detailed information about the alert message.'
	},
	{
		name: 'Alert.CloseButton',
		description: 'Optional button surface for user-managed dismissal or custom actions.'
	},
	{
		name: 'Alert.Actions',
		description: 'Container for action buttons or interactive elements related to the alert.'
	}
];

export const metadata = {
	title: 'Alert - Svelte Atoms',
	description: 'Display important messages and notifications to users.',
	componentTitle: 'Alert',
	componentDescription:
		'Contextual feedback component for notifications, errors, and warnings with icons and action buttons.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Alert } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Alert' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
