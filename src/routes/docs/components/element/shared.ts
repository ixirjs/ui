const useCases = [
	{
		title: 'Custom components',
		description: 'Build a part that needs a raw element with motion but no atom.'
	},
	{
		title: 'SVG rendering',
		description: '`SvgElement` covers the SVG tag namespace that HTML props cannot type.'
	},
	{
		title: 'Polymorphic tags',
		description: 'Choose the rendered tag at runtime while keeping attributes typed.'
	}
];

export const metadata = {
	title: 'Element - Svelte Atoms',
	description: 'The primitive element renderers every atom is built on.',
	componentTitle: 'Element',
	componentDescription:
		'`HtmlElement` and `SvgElement` are low-level public renderers for a tag, its attributes, and motion. Built-in components render through the internal Kernel.',
	summary: 'Primitive HTML and SVG element renderers with motion support',
	category: 'Utility' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Element } from '@ixirjs/ui';",
	useCases,
	accessibility: [
		'Renders exactly the tag you pass — every role, label and attribute is yours to supply',
		'No implicit ARIA is added, which is what makes these safe to build on',
		'`scaleFade` and other motion respect the consumer’s reduced-motion preference'
	]
};
