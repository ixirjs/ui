const useCases = [
	{
		title: 'Overlay infrastructure',
		description: 'What Dialog, Drawer, Popover and Tooltip already render through.'
	},
	{
		title: 'Custom overlays',
		description: 'Give a component of your own the same layering and dismissal behaviour.'
	},
	{
		title: 'Teleporting content',
		description: 'Move a subtree to a named surface elsewhere in the same app root.'
	}
];

export const metadata = {
	title: 'Portal - IXIR UI',
	description: 'Render content into a different place in the tree without detaching from the body.',
	componentTitle: 'Portal',
	componentDescription:
		'The containment layer overlays are built on. A portal is a *place*: content renders into a named surface that stays inside the app root, so theming, CSS containment and event bubbling keep working. Layering is opted into per surface.',
	summary: 'Render content into a named surface without detaching to the body',
	category: 'Utility' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Portal } from '@ixirjs/ui';",
	useCases,
	accessibility: [
		'Content stays within the app root, so a screen reader’s reading order remains coherent',
		'Focus can be trapped and restored by the surface, rather than by each overlay separately',
		'The escape stack is shared, so nested overlays close in the order the user opened them',
		'Not the browser top layer — see ADR 0007 for why containment was chosen over `showModal`'
	]
};
