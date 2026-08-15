import { createExampleLoader, type ExampleFn } from './example-loader';

// Every component page's examples, globbed once — previously seven identical lines in fifty
// `content.svelte` files. A glob path must be a literal, not relative.
//
// Both globs stay lazy. The raw one was `eager: true`, affordable only while each page globbed its
// own directory; hoisted, it would put all 129 sources (79 KB) into a chunk every docs page loads.
// So `loadExamples` awaits one component's worth, off the render path.
const loaders = import.meta.glob('/src/routes/docs/components/*/examples/*.svelte');

const sources = import.meta.glob('/src/routes/docs/components/*/examples/*.svelte', {
	query: '?raw',
	import: 'default'
}) as Record<string, () => Promise<string>>;

/**
 * The `ex('./examples/basic.svelte')` helper for one component, its sources already resolved. Keys
 * are rebased to the `./examples/…` form pages call it with, so call sites are unchanged.
 */
export async function loadExamples(slug: string): Promise<ExampleFn> {
	const prefix = `/src/routes/docs/components/${slug}/examples/`;
	const rebase = (path: string) => `./examples/${path.slice(prefix.length)}`;
	const mine = (path: string) => path.startsWith(prefix);

	const resolved = await Promise.all(
		Object.entries(sources)
			.filter(([path]) => mine(path))
			.map(async ([path, load]) => [rebase(path), await load()] as const)
	);

	const components = Object.fromEntries(
		Object.entries(loaders)
			.filter(([path]) => mine(path))
			.map(([path, load]) => [rebase(path), load])
	);

	return createExampleLoader(components, Object.fromEntries(resolved));
}
