export const metadata = {
	title: '@svelte-atoms/core Documentation',
	description:
		'Complete documentation for @svelte-atoms/core - a modern UI component library for Svelte 5.',
	pageTitle: 'Documentation',
	pageDescription:
		'@svelte-atoms/core is a modern UI component library built with Svelte 5, TypeScript, and Tailwind CSS. It provides a comprehensive set of headless components with full accessibility, keyboard navigation, and flexible styling through variants and presets.',
	breadcrumbs: [{ label: 'Docs' }],

	overview:
		'Svelte Atoms is a modern, headless UI component library built for Svelte 5. It combines the power of atomic design principles with practical, production-ready components. Every component is built with accessibility, keyboard navigation, and type safety as first-class citizens.',

	sections: [
		{
			title: 'Getting Started',
			description: 'Learn the fundamentals of Svelte Atoms and how to use it in your projects.'
		},
		{
			title: 'Core Concepts',
			description: 'Understand atoms, bonds, and the design philosophy behind the library.'
		},
		{
			title: 'Styling & Theming',
			description: 'Learn the variants and preset systems for powerful, flexible component styling.'
		},
		{
			title: 'Components',
			description:
				'Explore the complete library of UI components with examples and API documentation.'
		},
		{
			title: 'Advanced',
			description: 'Dive into composition patterns, animations, and crafting custom components.'
		}
	],

	documentation: {
		gettingStarted: [
			{
				title: 'Overview',
				href: '/docs/overview/llms.txt',
				description: 'Library overview and introduction'
			},
			{
				title: 'Philosophy',
				href: '/docs/philosophy/llms.txt',
				description: 'Design principles and concepts'
			},
			{
				title: 'Quick Start',
				href: '/docs/quick-start/llms.txt',
				description: 'Get up and running quickly'
			},
			{
				title: 'Quick Reference',
				href: '/docs/quick-reference/llms.txt',
				description: 'Common patterns and shortcuts'
			},
			{
				title: 'Migration Guide',
				href: '/docs/migration/llms.txt',
				description: 'Move older BondState and Bond-owned Atom code to the current model'
			}
		],
		fundamentals: [
			{
				title: 'Imports',
				href: '/docs/imports/llms.txt',
				description: 'Import patterns and conventions'
			},
			{
				title: 'Naming Convention',
				href: '/docs/naming-convention/llms.txt',
				description: 'File and component naming'
			},
			{ title: 'Usage', href: '/docs/usage/llms.txt', description: 'Component usage patterns' },
			{ title: 'Atoms', href: '/docs/atoms/llms.txt', description: 'Understanding atoms' },
			{ title: 'Bonds', href: '/docs/bonds/llms.txt', description: 'Understanding bonds' }
		],
		styling: [
			{ title: 'Styling', href: '/docs/styling/llms.txt', description: 'CSS and styling guide' },
			{
				title: 'Variants',
				href: '/docs/variants/llms.txt',
				description: 'Component variants system'
			},
			{ title: 'Preset', href: '/docs/preset/llms.txt', description: 'Theme presets system' },
			{
				title: 'Preset-Variant Integration',
				href: '/docs/preset-variant-integration/llms.txt',
				description: 'Combining presets and variants'
			}
		],
		advanced: [
			{
				title: 'Composition',
				href: '/docs/composition/llms.txt',
				description: 'Component composition patterns'
			},
			{
				title: 'Crafting',
				href: '/docs/crafting/llms.txt',
				description: 'Creating custom components'
			},
			{
				title: 'Extending & Fusing',
				href: '/docs/extending/llms.txt',
				description: 'Extend, fuse, and author components with defineBond, fuse, and capabilities'
			},
			{
				title: 'Motion',
				href: '/docs/motion/llms.txt',
				description: 'Motion and animation system'
			},
			{
				title: 'Transitions',
				href: '/docs/transitions/llms.txt',
				description: 'Transitions and animations'
			},
			{
				title: 'Accessibility',
				href: '/docs/accessibility/llms.txt',
				description: 'Accessibility features'
			}
		],
		layout: [
			{ title: 'Stack', href: '/docs/components/stack/llms.txt', description: 'Stack component' },
			{
				title: 'Divider',
				href: '/docs/components/divider/llms.txt',
				description: 'Divider component'
			},
			{ title: 'List', href: '/docs/components/list/llms.txt', description: 'List component' },
			{
				title: 'Scrollable',
				href: '/docs/components/scrollable/llms.txt',
				description: 'Scrollable component'
			}
		],
		navigation: [
			{
				title: 'Breadcrumb',
				href: '/docs/components/breadcrumb/llms.txt',
				description: 'Breadcrumb component'
			},
			{ title: 'Link', href: '/docs/components/link/llms.txt', description: 'Link component' },
			{ title: 'Menu', href: '/docs/components/menu/llms.txt', description: 'Menu component' },
			{
				title: 'Sidebar',
				href: '/docs/components/sidebar/llms.txt',
				description: 'Sidebar component'
			},
			{ title: 'Tabs', href: '/docs/components/tabs/llms.txt', description: 'Tabs component' }
		],
		forms: [
			{
				title: 'Button',
				href: '/docs/components/button/llms.txt',
				description: 'Button component'
			},
			{ title: 'Input', href: '/docs/components/input/llms.txt', description: 'Input component' },
			{
				title: 'Textarea',
				href: '/docs/components/textarea/llms.txt',
				description: 'Textarea component'
			},
			{
				title: 'Checkbox',
				href: '/docs/components/checkbox/llms.txt',
				description: 'Checkbox component'
			},
			{ title: 'Radio', href: '/docs/components/radio/llms.txt', description: 'Radio component' },
			{
				title: 'Kbd',
				href: '/docs/components/kbd/llms.txt',
				description: 'Kbd and Shortcut components'
			},
			{ title: 'Label', href: '/docs/components/label/llms.txt', description: 'Label component' },
			{ title: 'Form', href: '/docs/components/form/llms.txt', description: 'Form component' },
			{
				title: 'Combobox',
				href: '/docs/components/combobox/llms.txt',
				description: 'Combobox component'
			}
		],
		display: [
			{ title: 'Card', href: '/docs/components/card/llms.txt', description: 'Card component' },
			{ title: 'Badge', href: '/docs/components/badge/llms.txt', description: 'Badge component' },
			{
				title: 'Avatar',
				href: '/docs/components/avatar/llms.txt',
				description: 'Avatar component'
			},
			{
				title: 'Datagrid',
				href: '/docs/components/datagrid/llms.txt',
				description: 'Datagrid component'
			},
			{ title: 'Tree', href: '/docs/components/tree/llms.txt', description: 'Tree component' }
		],
		overlays: [
			{
				title: 'Dialog',
				href: '/docs/components/dialog/llms.txt',
				description: 'Dialog component'
			},
			{
				title: 'Drawer',
				href: '/docs/components/drawer/llms.txt',
				description: 'Drawer component'
			},
			{
				title: 'Popover',
				href: '/docs/components/popover/llms.txt',
				description: 'Popover component'
			},
			{
				title: 'Dropdown',
				href: '/docs/components/dropdown/llms.txt',
				description: 'Dropdown component'
			},
			{
				title: 'Tooltip',
				href: '/docs/components/tooltip/llms.txt',
				description: 'Tooltip component'
			},
			{ title: 'Toast', href: '/docs/components/toast/llms.txt', description: 'Toast component' }
		],
		interactive: [
			{
				title: 'Accordion',
				href: '/docs/components/accordion/llms.txt',
				description: 'Accordion component'
			},
			{
				title: 'Collapsible',
				href: '/docs/components/collapsible/llms.txt',
				description: 'Collapsible component'
			},
			{ title: 'Alert', href: '/docs/components/alert/llms.txt', description: 'Alert component' },
			{
				title: 'Stepper',
				href: '/docs/components/stepper/llms.txt',
				description: 'Stepper component'
			}
		],
		core: [
			{ title: 'Atom', href: '/docs/components/atom/llms.txt', description: 'Core atom component' }
		]
	}
};
