const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  avatar: () => ({
    class: 'inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground overflow-hidden',
    variants: {
      size: {
        sm: { class: 'h-8 w-8 text-xs' },
        md: { class: 'h-10 w-10 text-sm' },
        lg: { class: 'h-12 w-12 text-base' },
        xl: { class: 'h-16 w-16 text-lg' }
      }
    },
    defaults: {
      size: 'md'
    }
  })
});`.trim();

const accessibilityFeatures = [
	'Proper alt text for images passed to screen readers',
	'Meaningful initials as fallback when image fails or is absent',
	'Adequate color contrast for initials against background',
	'Image uses role="presentation" to avoid redundant announcements',
	'aria-label support for custom content'
];

const useCases = [
	{
		title: 'User Profile Pictures',
		description:
			'Display profile images in navigation bars, sidebars, and headers to identify the currently signed-in user.'
	},
	{
		title: 'Comment Threads',
		description:
			'Show author avatars alongside comments, posts, and replies in discussion boards and social feeds.'
	},
	{
		title: 'Contact Lists',
		description:
			'Represent contacts, team members, or collaborators with images or initials in lists and tables.'
	},
	{
		title: 'Avatar Groups',
		description:
			'Stack multiple avatars to show who has liked, viewed, or is participating in a shared resource.'
	},
	{
		title: 'Activity Feeds',
		description:
			'Pair avatars with activity entries to give visual context about who performed each action.'
	},
	{
		title: 'Chat Interfaces',
		description:
			'Display sender avatars in chat UIs so users can quickly identify message authors at a glance.'
	}
];

export const metadata = {
	title: 'Avatar - Svelte Atoms',
	description: 'Display user profile images with automatic initials fallback.',
	componentTitle: 'Avatar',
	componentDescription:
		'User profile image with automatic fallback to generated initials and customizable sizes.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Avatar } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Avatar' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
