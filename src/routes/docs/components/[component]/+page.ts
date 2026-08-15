import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { ComponentDocMeta } from '$docs/types';
import { loadExamples } from '$docs/utils/examples';
import type { PageLoad } from './$types';

// One route for every component page. Each was its own `+page.svelte` reading `./shared` and
// rendering `./content.svelte` — fifty-one files, two md5 groups, differing by a blank line. The
// sibling `llms.txt/+server.ts` already resolved content this way; this is the same glob for the
// HTML mode. A page needing a hand-written head keeps its own static sibling route — SvelteKit
// resolves static segments before this dynamic one.
//
// Content is globbed lazily and metadata eagerly on purpose: an eager content glob would pull all
// fifty-one pages, their examples and their prop tables into a single client chunk.
const contents = import.meta.glob<{ default: Component }>(
	'/src/routes/docs/components/*/content.svelte'
);

const metas = import.meta.glob<{ metadata: ComponentDocMeta }>(
	'/src/routes/docs/components/*/shared.ts',
	{ eager: true }
);

export const load: PageLoad = async ({ params }) => {
	const load = contents[`/src/routes/docs/components/${params.component}/content.svelte`];
	const meta = metas[`/src/routes/docs/components/${params.component}/shared.ts`];

	if (!load || !meta) error(404, `No docs content for component "${params.component}"`);

	return {
		Content: (await load()).default,
		metadata: meta.metadata,
		ex: await loadExamples(params.component)
	};
};
