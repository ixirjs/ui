// One nav manifest, read by the header, the docs sidebar, the ⌘K palette, the docs index and the
// footer. The component list is never written here — `registry` derives it from the filesystem.

import { components } from '$docs/registry';

export interface NavItem {
	label: string;
	href: string;
	/** One-line blurb; shown in the palette and on the docs index. */
	summary?: string;
	/** Trailing label in the palette — a component's category. Absent where the group says it all. */
	meta?: string;
}

export interface NavGroup {
	title: string;
	/** Shown under the group title in the sidebar. Absent for groups that need no framing. */
	note?: string;
	items: NavItem[];
}

/** The four header slots. The design's shape; these labels point at pages that exist. */
export const headerNav = [
	{ label: 'Guides', href: '/docs' },
	{ label: 'Components', href: '/docs/components' },
	{ label: 'Styling', href: '/docs/styling' },
	{ label: 'Accessibility', href: '/docs/accessibility' }
];

/** The sidebar, in reading order: start, then task recipes, then the why, then the catalog. */
export const navGroups: NavGroup[] = [
	{
		title: 'Get started',
		note: 'Follow these in order.',
		items: [
			{ label: 'Introduction', href: '/docs', summary: 'What the library is and is not' },
			{
				label: 'Quick start',
				href: '/docs/quick-start',
				summary: 'Install, preset, first component'
			},
			{
				label: 'Migration guide',
				href: '/docs/migration',
				summary: 'Moving between released surfaces'
			}
		]
	},
	{
		title: 'Guides',
		note: 'Task recipes for a working app.',
		items: [
			{
				label: 'Theming with presets',
				href: '/docs/preset',
				summary: 'Where every class name lives'
			},
			{ label: 'Styling', href: '/docs/styling', summary: 'Classes, variants and escape hatches' },
			{
				label: 'Extending & fusing',
				href: '/docs/extending',
				summary: 'Replace a Bond constructor to extend a family'
			}
		]
	},
	{
		title: 'Concepts',
		note: 'Why the library is shaped this way.',
		items: [
			{
				label: 'Bonds',
				href: '/docs/bonds',
				summary: 'Shared state between the parts of one component'
			},
			{
				label: 'Philosophy',
				href: '/docs/philosophy',
				summary: 'Why the library is shaped this way'
			},
			{
				label: 'Accessibility',
				href: '/docs/accessibility',
				summary: 'The contract every component keeps'
			}
		]
	},
	{
		title: 'Components',
		items: components.map((entry) => ({
			label: entry.title,
			href: entry.href,
			summary: entry.summary,
			meta: entry.category
		}))
	},
	{
		title: 'Reference',
		items: [
			{
				label: 'All components',
				href: '/docs/components',
				summary: 'The full catalog, by category'
			},
			{
				label: 'llms.txt',
				href: '/docs/llms.txt',
				summary: 'Every page as clean Markdown, for agents'
			}
		]
	}
];

/**
 * Flat index — what the palette searches, and the page order prev/next follows. `group` is the
 * item's classification: it is the palette's section heading and the kind column on the docs index,
 * so no item restates a `kind` its group already knows.
 */
export const allNavItems = navGroups.flatMap((group) =>
	group.items.map((item) => ({ ...item, group: group.title }))
);

/** High-traffic destinations — the docs index's "Jump to" list and the 404 page. Keyed by href, so
 *  reordering a group cannot silently change which pages these are. */
export const quickLinks = [
	'/docs/quick-start',
	'/docs/preset',
	'/docs/bonds',
	'/docs/components',
	'/docs/llms.txt'
].flatMap((href) => allNavItems.filter((item) => item.href === href).slice(0, 1));

/** `true` when `pathname` is `href` or a page below it. Short prefixes never match a child. */
export function isActive(pathname: string, href: string): boolean {
	return pathname === href || (href.length > 5 && pathname.startsWith(href + '/'));
}
