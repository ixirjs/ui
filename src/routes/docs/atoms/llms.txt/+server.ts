import Page from './template.svelte';
import { metadata } from '../shared';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'atoms',
	title: 'Atoms Concept',
	category: 'fundamentals',
	depth: 'beginner',
	prerequisites: ['philosophy'],
	related: ['bonds', 'crafting']
};

export function GET() {
	const text = renderLlmContent(Page, { frontmatter, metadata });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
