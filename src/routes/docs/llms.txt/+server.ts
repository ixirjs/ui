import Page from './template.svelte';
import { metadata } from '../shared';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';
import type { RequestHandler } from './$types';

const frontmatter: Frontmatter = {
	id: 'docs-index',
	title: '@ixirjs/ui Documentation',
	category: 'getting-started',
	depth: 'beginner',
	prerequisites: [],
	related: ['overview', 'quick-start', 'components']
};

export const GET: RequestHandler = () => {
	const text = renderLlmContent(Page, { frontmatter, metadata });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
};
