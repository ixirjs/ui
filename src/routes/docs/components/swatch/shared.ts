const accessibilityFeatures = [
	'Decorative by default — add aria-label when the color carries meaning',
	'Checkerboard pattern communicates transparency visually',
	'Use sufficient contrast between swatch border and background'
];

export const metadata = {
	title: 'Swatch - Svelte Atoms',
	description: 'Color swatch tile for palette display and color picker UIs.',
	componentTitle: 'Swatch',
	componentDescription:
		'Displays a color value as a small preview square. Shows a checkerboard pattern for transparent or empty colors.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Swatch } from '@ixirjs/ui/components/swatch';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Swatch' }],
	examples: {},
	accessibility: accessibilityFeatures
};
