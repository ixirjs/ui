const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  badge: () => ({
    class: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'
  })
});
`.trim();

const accessibilityFeatures = [
	'Semantic HTML structure',
	'Sufficient color contrast',
	'Screen reader friendly text',
	'ARIA labels for icons or counts',
	'Keyboard accessible when interactive'
];

const useCases = [
	{
		title: 'Status Indicators',
		description:
			'Display the current state of items like "Active", "Pending", "Completed" in task lists or order tracking.'
	},
	{
		title: 'Notification Counts',
		description:
			'Show unread message counts, notification badges, or pending item numbers on icons and buttons.'
	},
	{
		title: 'Category Tags',
		description:
			'Label content with categories, topics, or tags in blog posts, products, or file systems.'
	},
	{
		title: 'User Roles',
		description:
			'Identify user permissions or roles like "Admin", "Moderator", "VIP" in profiles and listings.'
	},
	{
		title: 'Version Labels',
		description:
			'Mark features or content with version tags like "New", "Beta", "Deprecated", or "v2.0".'
	},
	{
		title: 'Priority Markers',
		description:
			'Highlight item priority levels such as "High", "Medium", "Low" in task managers and issue trackers.'
	}
];

export const metadata = {
	title: 'Badge - Svelte Atoms',
	description: 'Small count and labeling component for status and notifications.',
	componentTitle: 'Badge',
	componentDescription:
		'Compact inline element for status labels, counts, and tags with customizable variants and colors.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Badge } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Badge' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
