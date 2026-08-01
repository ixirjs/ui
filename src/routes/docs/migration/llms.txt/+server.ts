import Page from './template.svelte';

import type { Frontmatter } from '$docs/md/frontmatter';
import { renderLlmContent } from '$docs/utils/render-llm';

const frontmatter: Frontmatter = {
	id: 'migration',
	title: 'Migration Guide',
	category: 'getting-started',
	depth: 'intermediate',
	prerequisites: ['bonds', 'atoms'],
	related: ['bonds', 'atoms', 'extending']
};

export function GET() {
	const text = renderLlmContent(Page as never, { frontmatter });

	return new Response(text, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
