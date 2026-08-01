const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  link: () => ({
    class: 'text-primary underline-offset-4 hover:underline transition-colors',
    variants: {
      variant: {
        default: { class: 'text-primary' },
        muted: { class: 'text-muted-foreground' },
        destructive: { class: 'text-destructive' }
      }
    },
    defaults: {
      variant: 'default'
    }
  })
});
`.trim();

const accessibilityFeatures = [
	'Use meaningful link text',
	"Add rel='noopener noreferrer' for external links",
	'Ensure sufficient color contrast',
	'Make focused links clearly visible',
	'Screen reader friendly navigation'
];

const useCases = [
	{
		title: 'Internal Navigation',
		description:
			'Link to pages within your application with consistent, styled anchor elements that match your design system.'
	},
	{
		title: 'External Links',
		description:
			'Link to external websites with target="_blank" and rel="noopener noreferrer" for security and UX best practices.'
	},
	{
		title: 'Inline Text Links',
		description:
			'Embed contextual links within paragraphs or body text with underline styling to signal clickability.'
	},
	{
		title: 'Navigation Menus',
		description:
			'Build navigation bars, sidebars, and breadcrumbs using consistently styled link components.'
	},
	{
		title: 'Call to Action',
		description:
			'Use styled link variants to create muted or destructive contextual links for secondary or dangerous actions.'
	}
];

export const metadata = {
	title: 'Link - Svelte Atoms',
	description: 'Accessible anchor component for internal and external navigation links.',
	componentTitle: 'Link',
	componentDescription:
		'Styled anchor element with consistent hover/active states and preset-based variants.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Link } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Link' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
