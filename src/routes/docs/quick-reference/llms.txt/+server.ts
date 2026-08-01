import Page from './template.svelte';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'quick-reference',
	title: 'Quick Reference',
	category: 'reference',
	depth: 'foundational',
	prerequisites: [],
	related: ['overview', 'usage']
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
