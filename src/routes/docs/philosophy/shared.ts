export const metadata = {
	title: 'Philosophy - IXIR UI',
	description: 'Understanding the principles and architecture behind IXIR UI.',
	pageTitle: 'Philosophy',
	pageDescription: 'Understanding the principles and architecture that make IXIR UI different.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Philosophy' }],
	corePrinciples: [
		{
			title: 'Composition Over Configuration',
			description:
				'Build complex UI by combining simple, focused primitives rather than configuring monolithic components. Each component does one thing well.',
			benefits: [
				'Maximum flexibility in component structure',
				'No artificial limitations on what you can build',
				'Easy to understand component behavior',
				'Predictable composition patterns'
			]
		},
		{
			title: 'Unstyled by Default',
			description:
				'Components provide behavior and accessibility without imposing visual design decisions. You control styling completely.',
			benefits: [
				'Perfect fit for any design system',
				'No fighting against default styles',
				'Use any styling approach (Tailwind, CSS-in-JS, etc.)',
				'Smaller bundle sizes (no unused styles)'
			]
		},
		{
			title: 'Accessibility First',
			description:
				'Proper ARIA attributes, keyboard navigation, and focus management are built-in, not added as afterthoughts.',
			benefits: [
				'WCAG 2.1 compliant by default',
				'Automatic ARIA attribute management',
				'Full keyboard navigation support',
				'Screen reader optimized'
			]
		}
	],
	bondArchitecture: {
		description:
			'The Bond pattern is our approach to state management and component communication.',
		whatIsBond:
			"A Bond is a self-contained unit of state and behavior. It's like a mini store that lives inside a component tree, managing its own state and exposing methods to interact with it.",
		features: [
			{
				title: 'Encapsulation',
				description:
					"Bonds keep component state isolated. No global stores, no prop drilling. State lives where it's needed."
			},
			{
				title: 'Flexibility',
				description:
					'Bonds can be created inside or outside components. Pass them as props, share them between components, or use them standalone.'
			},
			{
				title: 'Type Safety',
				description:
					'Full TypeScript support with inferred types. Your IDE knows exactly what methods and properties are available.'
			}
		]
	},
	whySvelte5: [
		{
			feature: 'Runes API',
			description:
				"Fine-grained reactivity with $state, $derived, and $effect enables patterns that weren't possible before.",
			impact: 'Precise control over reactivity and optimal performance'
		},
		{
			feature: 'Snippets',
			description:
				'Reusable template fragments replace render props and slots with a more intuitive pattern.',
			impact: 'Cleaner component composition and better type inference'
		},
		{
			feature: 'Enhanced Performance',
			description:
				'New compiler and runtime optimizations make components faster and more efficient.',
			impact: 'Better runtime performance with less overhead'
		}
	],
	customizationPhilosophy: {
		description: 'We believe in giving you full control without sacrificing convenience.',
		approaches: [
			{
				title: 'Style Your Way',
				description:
					'Use Tailwind, CSS modules, styled-components, or plain CSS. Components work with any styling approach.'
			},
			{
				title: 'Preset System',
				description:
					'Define global styles once, apply everywhere. Override at any level: global, route, or component.'
			},
			{
				title: 'Component Props',
				description:
					'Every component accepts standard HTML props plus custom styling props. Full TypeScript autocomplete.'
			},
			{
				title: 'Escape Hatches',
				description:
					'Need to bypass something? Access internal bonds, override any prop, or build completely custom implementations.'
			}
		]
	},
	designGoals: [
		{
			goal: 'Developer Experience',
			priority: 'High',
			description:
				'Intuitive API, great TypeScript support, helpful error messages, and comprehensive documentation.'
		},
		{
			goal: 'Performance',
			priority: 'High',
			description:
				"Leverage Svelte 5's reactivity for minimal re-renders. Zero runtime overhead, tree-shakeable, and optimized bundle size."
		},
		{
			goal: 'Accessibility',
			priority: 'High',
			description:
				'WCAG 2.1 AA compliance, automatic ARIA attributes, keyboard navigation, focus management, and screen reader support.'
		},
		{
			goal: 'Flexibility',
			priority: 'High',
			description:
				'Compose components however you want. Swap implementations, customize behavior, and adapt to any design system.'
		}
	],
	whatWeAreNot: [
		{
			title: 'Not a UI Kit',
			description:
				"We don't provide pre-designed components with opinionated styling. We provide behavioral primitives you style yourself."
		},
		{
			title: 'Not a Framework',
			description:
				"We don't force architectural decisions or patterns. Use with any Svelte app architecture."
		},
		{
			title: 'Not Batteries-Included',
			description:
				"We don't include every possible feature. We focus on core primitives that enable you to build anything."
		}
	]
};
