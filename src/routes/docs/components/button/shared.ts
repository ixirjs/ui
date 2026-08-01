const presetCode = `import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  button: () => ({
    class: 'px-3 py-2 h-12 disabled:opacity-50 disabled:pointer-events-none items-center transition-colors duration-100',
    variants: {
      variant: {
        primary:     { class: 'bg-primary text-primary-foreground hover:bg-primary/80' },
        secondary:   { class: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
        destructive: { class: 'bg-destructive text-destructive-foreground hover:bg-destructive/80' },
        outline:     { class: 'bg-foreground/0 border border-border hover:border-foreground/25' },
        ghost:       { class: 'bg-transparent hover:bg-accent/90 text-accent-foreground' },
      },
    },
    defaults: { variant: 'primary' },
  }),
});`;

const useCases = [
	{
		title: 'Form Submissions',
		description:
			'Primary actions in forms like submit, save, or confirm operations that trigger data processing.'
	},
	{
		title: 'Navigation Actions',
		description:
			'Trigger navigation to different pages or sections, such as "Learn More" or "Get Started" buttons.'
	},
	{
		title: 'Dialog Controls',
		description:
			'Control dialog flows with action buttons like Cancel, Confirm, Delete, or Save in modal interfaces.'
	},
	{
		title: 'Data Operations',
		description:
			'Execute operations on data such as export, download, refresh, or filter in dashboards and tables.'
	},
	{
		title: 'Interactive Features',
		description:
			'Enable user interactions like like, share, bookmark, or follow in social and content platforms.'
	},
	{
		title: 'Call-to-Action',
		description:
			'Highlight primary conversion points in marketing pages such as sign-up, purchase, or trial buttons.'
	}
];

const accessibilityFeatures = [
	'Proper semantic button element with role',
	'Keyboard navigation support (Enter and Space keys)',
	'Focus management with visible focus indicators',
	'Screen reader compatible with proper ARIA attributes',
	'Disabled state handling with aria-disabled',
	'Clear visual feedback for all interactive states'
];

export const metadata = {
	title: 'Button - Svelte Atoms',
	description: 'Interactive button component for triggering actions and events.',
	componentTitle: 'Button',
	componentDescription:
		'Versatile button with full HTML support, preset styling, disabled states, and icon content.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Button } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Button' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
