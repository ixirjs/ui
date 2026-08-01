import Page from './template.svelte';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'transitions',
	title: 'Transitions & Animations',
	category: 'advanced',
	depth: 'intermediate',
	prerequisites: ['motion'],
	related: ['motion', 'atoms']
};

export function GET() {
	const text = renderLlmContent(Page, { frontmatter });

	return new Response(text, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
