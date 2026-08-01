import Page from './template.svelte';
import { metadata } from '../shared';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'styling',
	title: 'Styling Guide',
	category: 'styling',
	depth: 'intermediate',
	prerequisites: ['atoms'],
	related: ['variants', 'preset', 'motion']
};

export function GET() {
	const text = renderLlmContent(Page, { frontmatter, metadata });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
