export const metadata = {
	title: 'Quick Start - Svelte Atoms',
	description: 'Get up and running with Svelte Atoms in minutes.',
	pageTitle: 'Quick Start',
	pageDescription:
		'Get up and running with Svelte Atoms in minutes. This guide will walk you through installation, configuration, and your first component.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Quick Start' }],
	requirements: [
		{
			requirement: 'Svelte 5',
			version: '^5.0.0',
			description: 'Svelte Atoms is built for Svelte 5 and uses runes extensively'
		},
		{
			requirement: 'Node.js',
			version: '>=18.0.0',
			description: 'Node.js 18 or higher for modern JavaScript features'
		},
		{
			requirement: 'TypeScript',
			version: '>=5.0.0 (recommended)',
			description: 'Full TypeScript support with excellent type inference'
		}
	],
	installationSteps: [
		{
			step: 1,
			title: 'Install Package',
			description:
				'Install @svelte-atoms/core using your preferred package manager (npm, pnpm, yarn, or bun)'
		},
		{
			step: 2,
			title: 'Import Internal Styles',
			description: 'Import the internal style file in your root layout (src/routes/+layout.svelte)'
		},
		{
			step: 3,
			title: 'Setup App CSS',
			description: 'Configure Tailwind CSS and CSS variables in your app.css file'
		},
		{
			step: 4,
			title: 'Configure Preset',
			description: 'Set up global component presets for consistent theming'
		}
	],
	nextSteps: [
		{
			title: 'Browse Components',
			description: "Explore the component library and see what's available",
			link: '/docs/components'
		},
		{
			title: 'Learn the Philosophy',
			description: 'Understand the principles behind Svelte Atoms',
			link: '/docs/philosophy'
		},
		{
			title: 'Styling Guide',
			description: 'Learn the styling system with Tailwind, variants, and presets',
			link: '/docs/styling'
		},
		{
			title: 'Advanced Patterns',
			description: 'Learn about bonds, composition, and advanced techniques',
			link: '/docs/bonds'
		}
	]
};
