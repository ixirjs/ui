import Page from './template.svelte';
import { metadata } from '../shared';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'quick-start',
	title: 'Quick Start Guide',
	category: 'getting-started',
	depth: 'beginner',
	related: ['philosophy', 'atoms', 'imports']
};

export function GET() {
	const text = renderLlmContent(Page, { frontmatter, metadata });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
