const useCases = [
	{
		title: 'Code splitting',
		description: 'Keep a heavy chart or editor out of the initial bundle.'
	},
	{
		title: 'Route-level panels',
		description: 'Load an admin panel only for the users who can open it.'
	},
	{
		title: 'Optional integrations',
		description: 'Import a third-party widget only once it is actually shown.'
	}
];

export const metadata = {
	title: 'Lazy - IXIR UI',
	description: 'Render a dynamically imported component with loading and error states.',
	componentTitle: 'Lazy',
	componentDescription:
		'Takes a `promise` resolving to a component and renders it once it arrives, with `loading` and `error` snippets for the states in between. Every other prop is forwarded to the loaded component.',
	summary: 'Render a dynamically imported component with loading and error states',
	category: 'Utility' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Lazy } from '@ixirjs/ui';",
	useCases,
	accessibility: [
		'Give the `loading` snippet `role="status"` so the wait is announced',
		'Render the `error` snippet as `role="alert"` — a failed import is a real failure, not a blank space',
		'Reserve the final layout in the loading state to avoid a shift when the component arrives'
	]
};
