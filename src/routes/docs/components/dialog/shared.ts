const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  dialog: () => ({
    class: 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
  }),
  'dialog.content': () => ({
    class: 'relative z-50 w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg'
  }),
  'dialog.header': () => ({
    class: 'flex flex-col space-y-1.5 text-center sm:text-left'
  }),
  'dialog.title': () => ({
    class: 'text-lg font-semibold leading-none tracking-tight'
  }),
  'dialog.body': () => ({
    class: 'py-4 text-sm text-muted-foreground'
  }),
  'dialog.footer': () => ({
    class: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'
  })
});`.trim();

const accessibilityFeatures = [
	'Focus trapped within dialog',
	'Escape key to close',
	'Proper ARIA attributes (role="dialog", aria-modal)',
	'Returns focus to trigger on close',
	'Screen reader announcements',
	'Keyboard navigation support'
];

const useCases = [
	{
		title: 'Critical User Decisions',
		description:
			'Display important confirmations or warnings that require explicit user action before proceeding (e.g., delete confirmations, irreversible actions).'
	},
	{
		title: 'Form Submissions',
		description:
			'Present complex forms or multi-step workflows in a focused overlay without navigating away from the current page.'
	},
	{
		title: 'Content Previews',
		description:
			'Show detailed information, images, or media content in an expanded view while maintaining context of the main page.'
	},
	{
		title: 'Authentication Flows',
		description:
			'Handle login, registration, or password reset flows in a modal overlay for seamless user experience.'
	},
	{
		title: 'Settings and Preferences',
		description:
			'Display application or user settings that need immediate attention without navigating to a separate page.'
	},
	{
		title: 'Notifications and Alerts',
		description:
			'Show important system messages, updates, or alerts that require user acknowledgment or action.'
	}
];

const componentsSummary = [
	{
		name: 'Dialog.Root',
		description:
			'Root container that manages the dialog state, backdrop, and focus trap. Controls the open/close state and coordinates all child components.'
	},
	{
		name: 'Dialog.Content',
		description:
			'Main container for the dialog content. Positioned centrally and handles enter/exit animations.'
	},
	{
		name: 'Dialog.Header',
		description:
			'Optional header section for dialog title and close button. Typically contains the dialog title and dismiss controls.'
	},
	{
		name: 'Dialog.Body',
		description:
			'Main content area of the dialog. Contains the primary content, forms, or information.'
	},
	{
		name: 'Dialog.Footer',
		description:
			'Optional footer section for action buttons. Typically contains confirm/cancel buttons or other actions.'
	},
	{
		name: 'Dialog.Title',
		description: 'Semantic title element with proper ARIA labeling for accessibility.'
	},
	{
		name: 'Dialog.Description',
		description: 'Semantic description element for providing additional context to screen readers.'
	},
	{
		name: 'Dialog.CloseButton',
		description:
			'Pre-configured button component that closes the dialog when clicked. Automatically wired to dialog state.'
	}
];

export const metadata = {
	title: 'Dialog - Svelte Atoms',
	description: 'Modal dialog for important user interactions.',
	componentTitle: 'Dialog',
	componentDescription:
		'Modal dialog for important user interactions that captures focus and requires user action.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Dialog } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Dialog' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
