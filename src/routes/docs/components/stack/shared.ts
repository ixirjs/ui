const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

setPreset({
  'stack.root': () => ({
    class: '' // grid container — add padding, background, etc.
  }),
  'stack.item': () => ({
    class: '' // each item occupies grid-area: 'stack'
  })
});`.trim();

const accessibilityFeatures = [
	'Uses CSS Grid — maintains DOM order for screen readers and keyboard navigation',
	'No absolute positioning — parent container sizes naturally to its largest child',
	'bind:value tracks the topmost item reactively for programmatic control',
	'Works alongside ARIA attributes on individual Stack.Item elements'
];

const componentsSummary = [
	{
		name: 'Stack.Root',
		description: 'Creates the CSS Grid stacking context. All children share the same grid area.'
	},
	{
		name: 'Stack.Item',
		description: 'An individual layer. Registers with StackState on mount for z-order tracking.'
	}
];

const useCases = [
	{
		title: 'Image Overlays',
		description:
			'Layer captions, gradients, or badges directly over images without absolute positioning.'
	},
	{
		title: 'Loading States',
		description:
			'Overlay a spinner or skeleton over content while preserving the original layout dimensions.'
	},
	{
		title: 'Notification Badges',
		description:
			'Position a badge counter over a button or avatar while keeping both in document flow.'
	},
	{
		title: 'Layer Panels',
		description:
			'Build interactive layer managers (like in design tools) using Bond z-order methods.'
	},
	{
		title: 'Card Stacks',
		description: 'Create deck-of-cards UIs where cards can be brought to front programmatically.'
	}
];

export const metadata = {
	title: 'Stack - Svelte Atoms',
	description:
		'Layout component for layering elements in the same visual space using CSS Grid. Keeps elements in document flow so the parent sizes to its largest child.',
	componentTitle: 'Stack',
	componentDescription:
		'Layers multiple elements in the same visual space using CSS Grid with natural parent sizing and z-order control.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Stack } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Stack' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
