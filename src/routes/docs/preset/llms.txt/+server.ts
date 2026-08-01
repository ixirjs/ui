import Page from './template.svelte';
import { metadata } from '../shared';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'preset',
	title: 'Preset System',
	category: 'styling',
	depth: 'intermediate',
	prerequisites: ['styling'],
	related: ['variants', 'preset-variant-integration']
};

export function GET() {
	const text = renderLlmContent(Page, { frontmatter, metadata });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
