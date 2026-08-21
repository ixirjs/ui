const useCases = [
	{
		title: 'Buttons and menu items',
		description: 'Pair an icon with a label at a size the preset controls.'
	},
	{
		title: 'Status indicators',
		description: 'Swap the `src` component to reflect state without touching layout.'
	},
	{
		title: 'Any icon library',
		description: 'lucide, phosphor, or a hand-drawn SVG component — all take the same seam.'
	}
];

export const metadata = {
	title: 'Icon - IXIR UI',
	description: 'Render any icon component through a consistent, presettable wrapper.',
	componentTitle: 'Icon',
	componentDescription:
		'Bring-your-own-icon wrapper: pass any Svelte component as `src` and it renders inside a presettable element, so sizing and colour are governed by your preset rather than per-call classes.',
	summary: 'Bring-your-own icon wrapper with preset-driven sizing',
	category: 'Display' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Icon } from '@ixirjs/ui';",
	useCases,
	accessibility: [
		'Decorative by default — pass `aria-hidden="true"` when the icon repeats adjacent text',
		'Give a standalone icon an `aria-label` so it is announced',
		'Sizing comes from the preset, so icons scale with text rather than a fixed pixel value',
		'No icon set is bundled: the consumer supplies the component, keeping the dependency optional'
	]
};
