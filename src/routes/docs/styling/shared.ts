export const metadata = {
	title: 'Styling System - Svelte Atoms',
	description: 'Learn the flexible styling system with Tailwind, variants, and presets.',
	pageTitle: 'Styling System',
	pageDescription:
		'Learn how to style Svelte Atoms components using Tailwind CSS, variants, presets, and custom CSS.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Styling' }],
	overview:
		'Svelte Atoms provides a flexible styling system that works with any approach: Tailwind CSS, CSS modules, styled-components, or plain CSS. Components are unstyled by default, giving you complete control.',
	stylingApproaches: [
		{
			approach: 'Tailwind CSS (Recommended)',
			description:
				'Use Tailwind utility classes directly on components for rapid development and consistent design',
			pros: ['Fast development', 'No CSS files', 'Automatic purging', 'Consistent spacing/colors'],
			cons: ['Learning curve', 'Verbose for complex styles']
		},
		{
			approach: 'Variant System',
			description: 'Define reusable style variants at the component level using defineVariants()',
			pros: [
				'Type-safe variants',
				'Automatic class merging',
				'Compound variants',
				'Theme consistency'
			],
			cons: ['Requires setup', 'Component-level abstraction']
		},
		{
			approach: 'Preset System',
			description: 'Set global component styles that apply across your entire application',
			pros: [
				'DRY principle',
				'Global theming',
				'Route-level overrides',
				'Reactive to component state'
			],
			cons: ['Global scope management', 'Debugging complexity']
		},
		{
			approach: 'Inline Styles',
			description: "Use the style attribute for dynamic values that can't be achieved with classes",
			pros: ['Dynamic values', 'Precise control', 'No class conflicts'],
			cons: ['Not purged', 'No pseudo-classes', 'Limited by CSS properties']
		}
	],
	keyFeatures: [
		'Works with Tailwind, CSS modules, or any styling solution',
		'cn() utility for intelligent class merging',
		'Color tokens via CSS variables',
		'Conditional class application',
		'Variant system with compounds',
		'Reactive variants based on component state',
		'Automatic preset class insertion with consumer-last precedence',
		'Full TypeScript support'
	],
	colorTokens: [
		{ token: 'background', usage: 'Main background color' },
		{ token: 'foreground', usage: 'Main text color' },
		{ token: 'primary', usage: 'Primary brand color' },
		{ token: 'primary-foreground', usage: 'Text on primary background' },
		{ token: 'secondary', usage: 'Secondary accent color' },
		{ token: 'secondary-foreground', usage: 'Text on secondary background' },
		{ token: 'muted', usage: 'Muted backgrounds' },
		{ token: 'muted-foreground', usage: 'Muted text color' },
		{ token: 'accent', usage: 'Accent color for highlights' },
		{ token: 'accent-foreground', usage: 'Text on accent background' },
		{ token: 'destructive', usage: 'Error/danger color' },
		{ token: 'destructive-foreground', usage: 'Text on destructive background' },
		{ token: 'border', usage: 'Border colors' },
		{ token: 'input', usage: 'Input border color' },
		{ token: 'ring', usage: 'Focus ring color' },
		{ token: 'card', usage: 'Card background' },
		{ token: 'card-foreground', usage: 'Card text color' },
		{ token: 'popover', usage: 'Popover background' },
		{ token: 'popover-foreground', usage: 'Popover text' }
	],
	bestPractices: [
		{
			category: 'Class Organization',
			practices: [
				'Order: layout → sizing → visual → state → overrides',
				'Use cn() for conditional classes',
				'Prefer Tailwind utilities over inline styles for static values',
				'Group related utilities together'
			]
		},
		{
			category: 'Variants',
			practices: [
				'Define variants for reusable patterns',
				'Use compound variants for multi-condition styling',
				'Set sensible defaults',
				'Keep variant logic simple and predictable'
			]
		},
		{
			category: 'Presets',
			practices: [
				'Set global presets at app root',
				'Override at route level for sections',
				'Use for common patterns, not one-offs',
				'Keep preset functions performant'
			]
		},
		{
			category: 'Performance',
			practices: [
				'Avoid creating new class strings in loops',
				'Memoize computed class lists',
				'Use Tailwind JIT for optimal bundle size',
				'Prefer static classes when possible'
			]
		}
	]
};
