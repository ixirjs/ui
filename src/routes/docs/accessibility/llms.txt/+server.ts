import Page from './template.svelte';
import { metadata } from '../shared';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'accessibility',
	title: 'Accessibility Features',
	category: 'fundamentals',
	depth: 'intermediate',
	prerequisites: ['philosophy', 'atoms'],
	related: ['crafting', 'components']
};

export function GET() {
	const text = renderLlmContent(Page, { frontmatter, metadata });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
