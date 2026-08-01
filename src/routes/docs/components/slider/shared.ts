const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  slider: () => ({
    class: 'relative h-6 w-full'
  }),
  'slider.track': () => ({
    class: 'h-2 rounded-full border border-border bg-input'
  }),
  'slider.fill': () => ({
    class: 'bg-primary'
  }),
  'slider.thumb': () => ({
    class: 'size-5 rounded-full border border-border bg-background shadow'
  })
});`.trim();

const accessibilityFeatures = [
	'Uses a native hidden input type="range" for robust keyboard and assistive technology support',
	'Supports keyboard interaction through the native range input semantics',
	'Exposes aria-valuemin, aria-valuemax, and aria-valuenow based on current slider state',
	'Supports aria-disabled and disabled behavior for non-interactive states',
	'Works with labels and forms via forwarded id and name props'
];

const useCases = [
	{
		title: 'Volume and Brightness Controls',
		description:
			'Provide smooth numeric adjustments for audio volume, media brightness, and similar linear controls.'
	},
	{
		title: 'Price and Value Filters',
		description:
			'Let users choose numeric thresholds such as max price, rating cutoffs, or distance radius in discovery screens.'
	},
	{
		title: 'Progress Scrubbing',
		description:
			'Allow users to scrub through timelines such as media playback, onboarding progress, or simulation states.'
	},
	{
		title: 'Fine-tuned Settings',
		description:
			'Expose granular settings like blur radius, opacity, animation speed, or sensitivity as constrained numeric values.'
	},
	{
		title: 'Vertical Control Rails',
		description:
			'Use vertical orientation for compact dashboards, editor sidebars, and mixer-like control panels.'
	}
];

export const metadata = {
	title: 'Slider - Svelte Atoms',
	description:
		'Accessible slider component for selecting numeric values across a configurable range.',
	componentTitle: 'Slider',
	componentDescription:
		'Single-value range input with bindable value, horizontal or vertical orientation, and customizable thumb and track rendering.',
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Slider } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Slider' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
