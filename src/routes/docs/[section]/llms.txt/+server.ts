import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { renderLlmContent } from '$docs/utils/render-llm';
import type { RequestHandler } from './$types';

// Same shape as the component route: guide pages whose llms.txt is their `content.svelte` rendered
// as markdown. Pages that render a `template.svelte` with frontmatter keep their static sibling.
const contents = import.meta.glob<{ default: Component }>(
	'/src/routes/docs/*/llms.txt/content.svelte'
);

export const GET: RequestHandler = async ({ params }) => {
	const load = contents[`/src/routes/docs/${params.section}/llms.txt/content.svelte`];
	if (!load) error(404, `No docs content for "${params.section}"`);

	const text = renderLlmContent((await load()).default, { contentType: 'markdown' });

	return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
