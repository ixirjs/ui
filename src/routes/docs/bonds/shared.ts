export const metadata = {
	title: 'Bonds - Svelte Atoms',
	description: 'Compound component coordination with Bond, Atom, and capabilities.',
	pageTitle: 'Bonds',
	pageDescription:
		'Bonds coordinate shared state, registered Atoms, context, and capabilities for compound component patterns.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Bonds' }],
	overview:
		'Bonds provide a structured way to manage component state, registered runtime atoms, and reusable behavior. They enable complex interactions while maintaining type safety and reactivity.',
	keyFeatures: [
		'Self-contained shared state',
		'Registered Atom lookup',
		'Type-safe Bond definitions',
		'Context sharing for compound components',
		'Reactive state with Svelte 5 runes',
		'Fine-grained reactivity tracking',
		'Bond and Atom capabilities',
		'Current Bond and Atom authoring APIs'
	],
	architecture: [
		{
			component: 'Bond',
			description:
				'Bond owns the public compound controller: props, derived values, mutation methods, context, capabilities, and registered Atoms.',
			responsibilities: [
				'Manage shared reactive props',
				'Provide derived computed properties and mutations',
				'Share itself through Svelte context',
				'Coordinate registered Atoms'
			]
		},
		{
			component: 'Atom',
			description:
				'Atom is the runtime atom created by the Atom Component that renders a part. It captures the element and produces spread props.',
			responsibilities: [
				'Track one DOM element reference',
				'Generate attrs, handlers, and attachments',
				'Host local Atom capabilities',
				'Register and unregister with the Bond'
			]
		},
		{
			component: 'Capability / Particle',
			description:
				'Capabilities are reusable behavior units installed on Bond or Atom hosts. Particle is the metaphor; capability is the API name.',
			responsibilities: [
				'Expose reusable state surfaces',
				'Coordinate multiple Atoms',
				'Project role-specific behavior',
				'Install whole-bond lifecycle effects'
			]
		}
	],
	bondPatterns: [
		{
			title: 'Reactive Props',
			description:
				'Wrap bindable root props with defineState and defineProperty, then pass them directly to the Bond.',
			useCase: 'When you need optimal reactivity performance with selective dependency tracking'
		},
		{
			title: 'Component-Owned Atoms',
			description:
				'The Svelte part creates its own Atom with createAtomInstance and registers it with the Bond.',
			useCase: 'When a rendered part owns its DOM element and lifecycle'
		},
		{
			title: 'Registry Lookup',
			description: 'Use bond.node() and bond.nodes() to find rendered Atoms.',
			useCase: 'Building complex components with multiple sub-components that need shared state'
		},
		{
			title: 'Generated Methods',
			description:
				'Generated part methods construct Atoms directly; rendered parts should still register their own stable Atoms.',
			useCase: 'Keeping older authoring types available while components own DOM lifecycle'
		}
	]
};
