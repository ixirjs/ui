// Doc source for the MCP server.
//
// Docs are read by *calling* each llms.txt route handler in-process, never by fetching the
// deployed origin: the MCP handler has no reliable base URL at registration time, and
// `process.cwd()` has no `src/routes` in a built adapter output. import.meta.glob is resolved
// by Vite at build time, so the doc set is correct in dev and in production alike.

type LlmsRoute = { GET: () => Response | Promise<Response> };

const llmsRoutes = import.meta.glob<LlmsRoute>('/src/routes/docs/**/llms.txt/+server.ts');

/** '/src/routes/docs/components/button/llms.txt/+server.ts' -> 'components/button'.
 *  The docs root ('/src/routes/docs/llms.txt/...') has no path left and becomes 'index'. */
export function slugOf(path: string): string {
	return path.slice('/src/routes/docs/'.length, -'/llms.txt/+server.ts'.length) || 'index';
}

const docLoaders = new Map(
	Object.entries(llmsRoutes).map(([path, load]) => [slugOf(path), load] as const)
);

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
		const response = await (await load()).GET();
		const text = await response.text();
		docCache.set(slug, text);
		return text;
	} catch (error) {
		console.error(`[MCP Error] Failed to render doc: ${slug}`, error);
		return null;
	}
}
