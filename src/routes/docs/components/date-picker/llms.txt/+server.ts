import Content from '../content.svelte';
import { renderLlmContent } from '$docs/utils/render-llm';
export function GET() {
	const text = renderLlmContent(Content, { contentType: 'markdown' });
	return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
