const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

// Basic preset configuration
setPreset({
  list: () => ({
    class: 'space-y-2'
  }),
  'list.item': () => ({
    class: 'text-muted-foreground'
  }),
  'list.group': () => ({
    class: 'flex flex-col rounded-inherit border-border'
  }),
  'list.title': () => ({
    class: 'px-6 py-1 text-sm font-medium border-border'
  }),
  'list.divider': () => ({
    class: 'my-1'
  })
});
`.trim();

const accessibilityFeatures = [
	'Use semantic ul or ol elements',
	'Ensure interactive items are keyboard accessible',
	'Proper ARIA attributes for custom lists',
	'Screen reader friendly structure'
];

const useCases = [
	{
		title: 'Navigation Menus',
		description:
			'Build sidebar navigation or dropdown menus with grouped, titled sections and clickable list items.'
	},
	{
		title: 'Settings Panels',
		description:
			'Display grouped settings categories with titles and dividers for organized, scannable interfaces.'
	},
	{
		title: 'Content Feeds',
		description:
			'Render lists of articles, notifications, or messages where each item may include icons, metadata, and actions.'
	},
	{
		title: 'Step-by-step Instructions',
		description:
			'Use ordered lists to present numbered instructions or ranked items in a clear sequence.'
	},
	{
		title: 'Feature Lists',
		description:
			'Enumerate product features, benefits, or comparison points with optional icons for visual emphasis.'
	},
	{
		title: 'Action Lists',
		description:
			'Create interactive item lists where users can click items to trigger actions like navigation or selection.'
	}
];

const componentsSummary = [
	{
		name: 'List.Root',
		description:
			'Root container element rendered as ul or ol depending on context. Manages layout and shared list styles.'
	},
	{
		name: 'List.Item',
		description:
			'Individual list item rendered as an li element. Supports icons, actions, and clickable interactions.'
	},
	{
		name: 'List.Group',
		description:
			'Groups related list items together, typically with visual separation or indentation.'
	},
	{
		name: 'List.Title',
		description:
			'Section header within a grouped list, providing a label for a group of related items.'
	},
	{
		name: 'List.Divider',
		description: 'Visual separator between sections or groups of items in the list.'
	}
];

export const metadata = {
	title: 'List - Svelte Atoms',
	description:
		'Flexible list component for displaying collections of items with grouping, titles, and dividers.',
	componentTitle: 'List',
	componentDescription:
		'Structured list component with grouping, ordered/unordered variants, and interactive items.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { List } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'List' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
