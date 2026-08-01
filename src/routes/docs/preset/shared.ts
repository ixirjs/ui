export const metadata = {
	title: 'Preset System - Svelte Atoms',
	description: 'Global component styling and theming with the preset system.',
	pageTitle: 'Preset System',
	pageDescription:
		'Powerful preset system for global component styling and theming in Svelte Atoms.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Preset System' }],
	overview:
		'The preset system lets you define component styling globally and override it at any level. Set defaults once, customize anywhere.',
	keyFeatures: [
		'Hierarchical preset system (global → route → component)',
		'Dynamic presets with reactive Bond values',
		'Compound component support with dot notation',
		'$preset placeholder for controlled insertion',
		'Automatic class merging and conflict resolution',
		'Type-safe preset definitions',
		'Zero runtime overhead',
		'Works with any styling approach'
	],
	presetLevels: [
		{
			level: 'Global Preset',
			location: 'App root (+layout.svelte)',
			scope: 'Entire application',
			useCase: 'Define base theme and default component styles',
			priority: 'Lowest (overridden by route and component presets)'
		},
		{
			level: 'Route Preset',
			location: 'Route layout files',
			scope: 'Specific route and its children',
			useCase: 'Section-specific theming (admin panel, dashboard, etc.)',
			priority: 'Medium (overrides global, overridden by component)'
		},
		{
			level: 'Component Preset',
			location: 'Individual components',
			scope: 'Component subtree only',
			useCase: 'Component-specific overrides for unique instances',
			priority: 'Highest (overrides both global and route presets)'
		}
	],
	presetKeys: {
		simple: {
			description: 'For simple components, use the component name as preset key',
			example: 'button, card, badge, alert'
		},
		compound: {
			description: 'For compound components, use dot notation for sub-components',
			example: 'card.title, card.body, dialog.overlay, popover.content'
		}
	},
	advancedFeatures: [
		{
			feature: 'Reactive Presets',
			description: 'Access component Bond values for dynamic styling based on component state',
			example:
				'Change styles based on isOpen, isActive, or any Bond property using the bond parameter in preset functions'
		},
		{
			feature: '$preset Placeholder',
			description:
				'Control exactly where preset classes are inserted in the class string for fine-grained control',
			example: "class={['base-classes', '$preset', 'user-overrides']}"
		},
		{
			feature: 'Extended Attributes',
			description:
				'Presets can set any HTML attributes, not just classes (data-*, aria-*, role, etc.)',
			example: 'Set data-component, aria-label, or custom attributes globally'
		}
	]
};
