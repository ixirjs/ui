const presetCode = `import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  pagination: () => ({ class: 'flex items-center gap-2' }),
  'pagination.previous': () => ({ class: 'rounded-md px-3 py-1.5 text-sm' }),
  'pagination.next': () => ({ class: 'rounded-md px-3 py-1.5 text-sm' })
});`;

const useCases = [
	{
		title: 'Result lists',
		description: 'Step through search or table results a page at a time.'
	},
	{
		title: 'Unknown-length sources',
		description: 'Omit `total` for a cursor-based API and Next stays available.'
	},
	{
		title: 'Server-driven data',
		description: 'Bind `page` and refetch whenever it commits.'
	}
];

export const metadata = {
	title: 'Pagination - IXIR UI',
	description: 'Page-by-page navigation over a list of unknown or known length.',
	componentTitle: 'Pagination',
	componentDescription:
		'Bindable 1-based `page` with Previous and Next parts that commit through it. `total` may be omitted for an unknown-length source, in which case Next stays enabled.',
	summary: 'Previous/next page navigation with bindable page state',
	category: 'Navigation' as const,
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Pagination } from '@ixirjs/ui';",
	useCases,
	presetCode,
	accessibility: [
		'The root renders as a `<nav>` — give it an `aria-label` when a page has more than one',
		'Previous and Next are real buttons: Enter and Space activate them',
		'Both set `aria-disabled` and stop committing at the ends of the range',
		'Announce the current page in a live region so the change is not silent'
	]
};
