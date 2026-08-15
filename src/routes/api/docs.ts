// Doc source for the MCP server.
//
// Docs are read in-process, never by fetching the deployed origin: the MCP handler has no reliable
// base URL at registration time, and `process.cwd()` has no `src/routes` in a built adapter output.
// import.meta.glob is resolved by Vite at build time, so the doc set is correct in dev and in
// production alike.
//
// Two sources, mirroring the routes themselves: a doc needing frontmatter or hand-written text has
// its own `llms.txt/+server.ts`; everything else is served by the dynamic `[section]` /
// `[component]` routes straight off a `content.svelte`, and is discovered the same way here.

import type { Component } from 'svelte';
import { renderLlmContent } from '$docs/utils/render-llm';
import { loadExamples } from '$docs/utils/examples';

type LlmsRoute = { GET: () => Response | Promise<Response> };
type ContentModule = { default: Component };

const llmsRoutes = import.meta.glob<LlmsRoute>('/src/routes/docs/**/llms.txt/+server.ts');
const componentContent = import.meta.glob<ContentModule>(
	'/src/routes/docs/components/*/content.svelte'
);
const guideContent = import.meta.glob<ContentModule>('/src/routes/docs/*/llms.txt/content.svelte');

/** '/src/routes/docs/components/button/llms.txt/+server.ts' -> 'components/button'.
 *  The docs root ('/src/routes/docs/llms.txt/...') has no path left and becomes 'index'. */
export function slugOf(path: string): string {
	return path.slice('/src/routes/docs/'.length, -'/llms.txt/+server.ts'.length) || 'index';
}

const docLoaders = new Map<string, () => Promise<string>>();

// Own-handler docs first: a static route beats the dynamic one in SvelteKit, so it beats it here.
for (const [path, load] of Object.entries(llmsRoutes)) {
	// The dynamic routes are not docs themselves — their docs come from the content globs below.
	if (path.includes('/[')) continue;
	docLoaders.set(slugOf(path), async () => (await (await load()).GET()).text());
}

// `extra` is the per-page props beyond the mode — for components, the example loader its
// `<DocExample>`s read. Guides take none.
const renderContent =
	(load: () => Promise<ContentModule>, extra?: () => Promise<object>) => async () =>
		renderLlmContent((await load()).default, {
			contentType: 'markdown',
			...((await extra?.()) ?? {})
		});

for (const [path, load] of Object.entries(componentContent)) {
	const name = path.split('/').at(-2)!;
	const slug = `components/${name}`;
	if (!docLoaders.has(slug))
		docLoaders.set(
			slug,
			renderContent(load, async () => ({ ex: await loadExamples(name) }))
		);
}

for (const [path, load] of Object.entries(guideContent)) {
	const slug = path.split('/').at(-3)!;
	if (!docLoaders.has(slug)) docLoaders.set(slug, renderContent(load));
}

/** Every doc slug, sorted. Includes the 'components/<name>' entries. */
export const docSlugs = [...docLoaders.keys()].sort();

export const guideSlugs = docSlugs.filter((slug) => !slug.startsWith('components/'));

export const componentSlugs = docSlugs
	.filter((slug) => slug.startsWith('components/'))
	.map((slug) => slug.slice('components/'.length));

// Rendering a doc means rendering a Svelte component to string. Docs are static per deploy,
// so cache for the process lifetime.
const docCache = new Map<string, string>();

/** Rendered markdown for `slug`, or null when the slug is unknown or its route threw. */
export async function readDoc(slug: string): Promise<string | null> {
	const cached = docCache.get(slug);
	if (cached !== undefined) return cached;

	const load = docLoaders.get(slug);
	if (!load) return null;

	try {
		const text = await load();
		docCache.set(slug, text);
		return text;
	} catch (error) {
		console.error(`[MCP Error] Failed to render doc: ${slug}`, error);
		return null;
	}
}
