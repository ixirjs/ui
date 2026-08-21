// The component list, derived.
//
// It used to be written out four times — the sidebar nav in `+layout.svelte`, the catalog literal
// in `components/+page.svelte`, each page's own `shared.ts`, and a hand-wired prev/next pair in
// every `content.svelte`. They drifted: the catalog marked 16 components beta while their own
// pages still said stable. `shared.ts` is now the single source and everything else reads this.
//
// Same glob-and-derive shape as `src/routes/api/docs.ts`, for the same reason: the filesystem
// already knows which pages exist, so a hand-kept list can only be wrong.

import { COMPONENT_CATEGORIES, type ComponentCategory, type ComponentDocMeta } from '$docs/types';

export interface ComponentEntry {
	/** Directory name under `docs/components/`, e.g. `context-menu`. */
	slug: string;
	title: string;
	/** Terse blurb for the catalog card — not the longer page subtitle. */
	summary: string;
	category: ComponentCategory;
	status: 'stable' | 'beta';
	href: string;
	/** The page's own import line — what the home gallery's copy button yields. */
	importCode: string;
}

// Absolute glob, as in `src/routes/api/docs.ts` — this file lives under `src/docs`, but the pages
// it indexes live under `src/routes`.
const metas = import.meta.glob<{ metadata: ComponentDocMeta }>(
	'/src/routes/docs/components/*/shared.ts',
	{ eager: true }
);

/** Every component page, ordered by title. */
export const components: ComponentEntry[] = Object.entries(metas)
	.map(([path, mod]) => {
		const slug = path.split('/').at(-2)!;
		const meta = mod.metadata;
		return {
			slug,
			title: meta.componentTitle,
			summary: meta.summary,
			category: meta.category,
			status: meta.status,
			href: `/docs/components/${slug}`,
			importCode: meta.importCode
		};
	})
	.sort((a, b) => a.title.localeCompare(b.title));

const indexBySlug = new Map(components.map((entry, index) => [entry.slug, index]));

// Keyed on the metadata object's identity: the glob already pairs each module with its directory, so
// no `shared.ts` restates the slug. Titles are the obvious key and are wrong — `form`'s page is
// `form`, its title `Form & Field`.
const slugByMeta = new Map(
	Object.entries(metas).map(([path, mod]) => [mod.metadata, path.split('/').at(-2)!])
);

/**
 * Directory slug for a component's metadata module. `DocComponentPage` derives the frontmatter `id`
 * from it, which is what `siblingsOf` keys prev/next on. Undefined for metadata outside the glob,
 * where the caller falls back to an explicit prop.
 */
export function slugFor(meta: ComponentDocMeta): string | undefined {
	return slugByMeta.get(meta);
}

/**
 * Previous and next page in `components` order.
 *
 * Ends are open rather than wrapping — a "next" from the last component back to the first reads
 * as a broken link, not as a loop.
 */
export function siblingsOf(slug: string): {
	prev?: ComponentEntry | undefined;
	next?: ComponentEntry | undefined;
} {
	const index = indexBySlug.get(slug);
	if (index === undefined) return {};
	return { prev: components[index - 1], next: components[index + 1] };
}

/**
 * Up to three siblings in the same category, for the component page's "Related" grid.
 *
 * Category, not a hand-kept list: a per-page `related` array is a fifth copy of the catalog and the
 * one nobody updates when a component is added. A page that wants a specific set passes its own
 * `frontmatter.related` and that wins.
 */
export function relatedTo(slug: string, limit = 3): ComponentEntry[] {
	const index = indexBySlug.get(slug);
	const self = index === undefined ? undefined : components[index];
	if (!self) return [];
	return components.filter((e) => e.category === self.category && e.slug !== slug).slice(0, limit);
}

/** `Components / <title>` — the trail every component page had written out by hand. */
export function breadcrumbsFor(title: string) {
	return [{ label: 'Components', href: '/docs/components' }, { label: title }];
}

/** Catalog grouping, in `COMPONENT_CATEGORIES` order; empty categories are dropped. */
export const byCategory: { category: ComponentCategory; components: ComponentEntry[] }[] =
	COMPONENT_CATEGORIES.map((category) => ({
		category,
		components: components.filter((entry) => entry.category === category)
	})).filter((group) => group.components.length > 0);
