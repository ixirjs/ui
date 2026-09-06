import { afterEach, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createHighlighter } from 'shiki';
import CodeBlock from './code-block.svelte';

vi.mock('shiki', () => ({ createHighlighter: vi.fn() }));
afterEach(() => vi.restoreAllMocks());

it('renders code as text rather than HTML when highlighting fails', async () => {
	vi.mocked(createHighlighter).mockRejectedValueOnce(new Error('Highlighting unavailable'));
	vi.spyOn(console, 'error').mockImplementation(() => {});
	const code = '</code><img src=x onerror="alert(1)"><script>alert(2)</script>&lt;b&gt;';
	const { container } = render(CodeBlock, { code });

	await expect.poll(() => container.querySelector('pre code')?.textContent).toBe(code);
	expect(container.querySelector('img, script')).toBeNull();
});
