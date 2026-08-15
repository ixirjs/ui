import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { renderLlmContent } from '$docs/utils/render-llm';
import { loadExamples } from '$docs/utils/examples';
import type { RequestHandler } from './$types';

// One route for every component page whose llms.txt is just its `content.svelte` rendered as
// markdown. A page needing frontmatter or hand-written text keeps its own static sibling route —
// SvelteKit resolves static segments before this dynamic one.
const contents = import.meta.glob<{ default: Component }>(
	'/src/routes/docs/components/*/content.svelte'
);

export const GET: RequestHandler = async ({ params }) => {
	const load = contents[`/src/routes/docs/components/${params.component}/content.svelte`];
	if (!load) error(404, `No docs content for component "${params.component}"`);

	const text = renderLlmContent((await load()).default, {
		contentType: 'markdown',
		ex: await loadExamples(params.component)
	});

	return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
