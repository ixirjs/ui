const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

setPreset({
  'progress.linear': () => ({
    class: 'w-full'
  }),
  'progress.linear.track': () => ({
    class: 'h-3 rounded-full bg-input p-0.5'
  }),
  'progress.linear.fill': () => ({
    class: 'h-full rounded-full bg-primary transition-[width] duration-300'
  }),
  'progress.circular': () => ({
    class: 'size-12 text-primary'
  }),
  'progress.circular.track': () => ({
    class: 'stroke-input'
  }),
  'progress.circular.fill': () => ({
    class: 'stroke-primary'
  })
});`.trim();

const accessibilityFeatures = [
	'Uses role="progressbar" for screen-reader support',
	'Exposes aria-valuemin, aria-valuemax, and aria-valuenow attributes',
	'Omits aria-valuenow in indeterminate state as per ARIA spec',
	'Supports custom labels via the children snippet'
];

const useCases = [
	{
		title: 'File Uploads & Downloads',
		description:
			'Track the progress of file transfers with a determinate linear or circular indicator.'
	},
	{
		title: 'Loading States',
		description:
			'Use the indeterminate variant when the completion time is unknown, such as fetching remote data.'
	},
	{
		title: 'Task Completion',
		description:
			'Visualise how many steps of a multi-step workflow or onboarding flow have been completed.'
	},
	{
		title: 'Score & Stat Visualisation',
		description:
			'Display user scores, skill levels, or resource usage as circular or linear progress meters.'
	}
];

export const metadata = {
	title: 'Progress - Svelte Atoms',
	description: 'Linear and circular progress indicators with determinate and indeterminate states.',
	componentTitle: 'Progress',
	componentDescription:
		'Progress indicators inform users about the status of ongoing operations. Available in linear and circular variants with support for indeterminate animations.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { ProgressLinear, ProgressCircular } from '@ixirjs/ui/components/progress';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Progress' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
