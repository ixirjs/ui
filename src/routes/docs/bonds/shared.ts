export const metadata = {
	title: 'Bonds - IXIR UI',
	description: 'Compound component coordination with a plain state class, context, and the Kernel.',
	pageTitle: 'Bonds',
	pageDescription:
		'A Bond is a plain Svelte 5 state class shared through Kernel.context. Every part reads it and renders one element through Kernel.element.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Bonds' }],
	overview:
		'Bonds give a component family one place for shared state, derived values, mutation methods and element ids. There is no base class and no runtime registry: the root publishes the instance under a context key, and every part reads it.',
	keyFeatures: [
		'Plain state classes — no base class, no registry',
		'One context key per family, from Kernel.context',
		'SSR-deterministic element ids from Kernel.id',
		'One element seam: Kernel.element',
		'Reactive state with Svelte 5 runes',
		'Behaviour models reused as ordinary functions',
		'Cross-part ARIA without a node registry',
		'Controlled props committed through bindCommit'
	],
	architecture: [
		{
			component: 'Bond',
			description:
				'A plain state class owning the family: live props, derived getters, mutation methods, element ids, and any child collection.',
			responsibilities: [
				'Hold shared reactive props as live getters',
				'Expose derived getters and mutation methods',
				'Derive element ids from the root seed',
				'Register mounted children in a Map'
			]
		},
		{
			component: 'Part',
			description:
				'The Svelte component that renders one slot. It reads the Bond from context and calls Kernel.element with its preset, base classes and own attrs.',
			responsibilities: [
				'Read the Bond from context (get or getOrThrow)',
				'Declare its preset key, base classes and own attrs',
				'Spread el.attrs on a literal tag',
				'Bind one leaf with Kernel.render when it needs motion, base or a polymorphic tag'
			]
		},
		{
			component: 'Kernel',
			description:
				'The single element seam. It resolves presentation, merges attributes and handlers, and owns motion and renderer escalation.',
			responsibilities: [
				'Resolve preset, variants and the consumer class',
				'Merge attrs and compose handlers',
				'Own transitions, drivers and custom renderers',
				'Publish contexts and mint deterministic ids'
			]
		}
	],
	bondPatterns: [
		{
			title: 'Live Props',
			description:
				'The root builds an object of getters over its own props and hands it to the Bond, so a prop change is seen where it is read.',
			useCase: 'When the Bond must observe root props without snapshotting them'
		},
		{
			title: 'Controlled Commit',
			description:
				'The Bond decides, the root writes the bindable prop and fires the callback, through bond.bindCommit.',
			useCase: 'Controlled and uncontrolled state with one code path'
		},
		{
			title: 'Cross-Part ARIA',
			description:
				'A child writes its element id into a $state field on the parent at init; the parent reads it in attrs.',
			useCase: 'aria-labelledby, aria-controls and aria-describedby without a registry'
		},
		{
			title: 'Child Collection',
			description:
				'A parent keeps a mount-ordered Map; the child registers at init and releases on teardown.',
			useCase: 'Roving focus, typeahead and any order-dependent keyboard behaviour'
		}
	]
};
