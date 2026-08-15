const presetCode = `import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  container: () => ({ class: 'mx-auto w-full max-w-7xl px-4' })
});`;

const useCases = [
	{
		title: 'Reusable cards',
		description: 'One component that lays out differently in a sidebar and a main column.'
	},
	{
		title: 'Dashboard widgets',
		description: 'Adapt to the panel each widget is dropped into, not to the window.'
	},
	{
		title: 'Measurement',
		description: 'Read `clientWidth` when a chart needs a pixel count CSS cannot provide.'
	}
];

export const metadata = {
	title: 'Container - Svelte Atoms',
	description: 'CSS container query context with bindable measured size.',
	componentTitle: 'Container',
	componentDescription:
		'Establishes a CSS containment context so descendants can respond to *its* width rather than the viewport, and binds the measured `clientWidth`/`clientHeight` back out for the cases CSS cannot express.',
	summary: 'CSS container query context with bindable measured size',
	category: 'Layout' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Container } from '@ixirjs/ui';",
	useCases,
	presetCode,
	accessibility: [
		'Renders a plain element with no implicit role — semantics come from what you put inside',
		'Container queries adapt layout without a media query, so zoom and reflow behave correctly',
		'Prefer the CSS `@container` rule over the bound sizes; JS-driven layout can lag a resize'
	]
};
