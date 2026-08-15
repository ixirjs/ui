const useCases = [
	{
		title: 'Avatars and thumbnails',
		description: 'A fixed aspect ratio and radius applied from one preset key.'
	},
	{
		title: 'Media cards',
		description: 'The image slot of a card, sized by the preset rather than inline classes.'
	},
	{
		title: 'Content imagery',
		description: 'Article and product images that must stay consistent across a site.'
	}
];

export const metadata = {
	title: 'Image - Svelte Atoms',
	description: 'Image wrapper with a presettable container and graceful fallback.',
	componentTitle: 'Image',
	componentDescription:
		'Thin wrapper over an image with a presettable container element, so aspect ratio, radius and object-fit live in the preset instead of being repeated at every call site.',
	summary: 'Presettable image container with alt-text handling',
	category: 'Display' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Image } from '@ixirjs/ui';",
	useCases,
	accessibility: [
		'`alt` is forwarded to the underlying image and is required for meaningful pictures',
		'Pass `alt=""` for a decorative image so screen readers skip it',
		'The container carries the preset, so a missing image collapses predictably rather than to zero height'
	]
};
