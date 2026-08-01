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
			version: '^5.46.4',
			description: 'Ixir UI uses Svelte 5 runes and snippets'
		},
		{
			requirement: 'Tailwind CSS',
			version: '^4.0.0',
			description:
				'The documented styling setup uses Tailwind v4 CSS-first configuration and @source'
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
			title: 'Import foundation styles',
			description:
				'Import the public stylesheet before your application stylesheet in the root layout'
		},
		{
			step: 2,
			title: 'Configure Tailwind v4',
			description: 'Use @source in app.css so Tailwind scans Ixir UI utility classes'
		},
		{
			step: 3,
			title: 'Configure presets',
			description: 'Install the default preset and add your application presentation entries'
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
